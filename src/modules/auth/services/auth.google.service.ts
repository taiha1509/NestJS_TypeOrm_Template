import ConfigKey from '@/common/config/config-key';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { I18nService } from 'nestjs-i18n';
import { createWinstonLogger } from '../../../common/services/winston.service';
import {
    GoogleLoginLinkParameters,
    GoogleUserInfoUrl,
    MODULE_NAME,
} from '../auth.constant';
import { parseToCamelCase } from '../auth.helper';
import { IGoogleData } from '../auth.interface';

@Injectable()
export class AuthGoogleService {
    constructor(
        private readonly configService: ConfigService,
        private readonly i18n: I18nService,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    public getGoogleLoginUrl(
        query: { redirectUri: string },
        scope = GoogleLoginLinkParameters.scope,
        responseType = GoogleLoginLinkParameters.responseType,
        accessType = GoogleLoginLinkParameters.accessType,
        prompt = GoogleLoginLinkParameters.prompt,
    ) {
        try {
            const clientSecret = this.configService.get(
                ConfigKey.GOOGLE_CLIENT_SECRET,
            );
            const clientId = this.configService.get(ConfigKey.GOOGLE_CLIENT_ID);
            const googleClient = new OAuth2Client({ clientSecret, clientId });
            const googleLoginUrl = googleClient.generateAuthUrl({
                redirect_uri: query.redirectUri,
                scope,
                response_type: responseType,
                access_type: accessType,
                prompt,
            });
            return googleLoginUrl;
        } catch (error) {
            this.logger.error('Error in getGoogleLoginUrl: ', error);
            throw new InternalServerErrorException(error);
        }
    }
    public async verifyGoogleToken(token: string, redirectUri: string) {
        try {
            const googleAccessToken = await this.getAccessTokenFromCode(
                token,
                redirectUri,
            );
            if (!googleAccessToken) {
                return {
                    errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
                    success: false,
                };
            }
            const googleData = await this.getUserInfoFromAccessToken(
                googleAccessToken,
            );
            if (!googleData?.email) {
                return {
                    errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
                    success: false,
                };
            }
            return {
                googleData: parseToCamelCase(googleData),
                success: true,
            };
        } catch (error) {
            this.logger.error('Error in verifyGoogleToken: ', error);
            throw new InternalServerErrorException(error);
        }
    }

    public async getUserInfoFromAccessToken(
        accessToken: string,
    ): Promise<IGoogleData> {
        try {
            const clientSecret = this.configService.get(
                ConfigKey.GOOGLE_CLIENT_SECRET,
            );
            const clientId = this.configService.get(ConfigKey.GOOGLE_CLIENT_ID);
            const googleClient = new OAuth2Client({ clientSecret, clientId });
            const url = GoogleUserInfoUrl;

            googleClient.setCredentials({ access_token: accessToken }); // use the new auth client with the access_token
            const response = await googleClient.request({ url });
            return response?.data as IGoogleData;
        } catch (error) {
            this.logger.error('Error in getUserInfoFromAccessToken: ', error);
            throw new InternalServerErrorException(error);
        }
    }

    public async getAccessTokenFromCode(code: string, redirectUri: string) {
        try {
            const clientSecret = this.configService.get(
                ConfigKey.GOOGLE_CLIENT_SECRET,
            );
            const clientId = this.configService.get(ConfigKey.GOOGLE_CLIENT_ID);
            const googleClient = new OAuth2Client({ clientSecret, clientId });

            const result = await googleClient.getToken({
                code: code,
                redirect_uri: redirectUri,
            });

            return result?.tokens?.access_token || '';
        } catch (error) {
            this.logger.error('Error in getAccessTokenFromCode: ', error);
            throw new InternalServerErrorException(error);
        }
    }
}
