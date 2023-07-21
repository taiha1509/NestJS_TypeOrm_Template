import ConfigKey from '@/common/config/config-key';
import { DateFormat, HttpStatus } from '@/common/constants';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { extractToken } from '@/common/helpers/commonFunctions';
import { TrimBodyPipe } from '@/common/pipe/trim.body.pipe';
import { SendGridService } from '@/modules/common/services/sendgrid.service';
import { createWinstonLogger } from '@/common/services/winston.service';
import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import dayjs from 'dayjs';
import { I18nService } from 'nestjs-i18n';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import { UserSqlService } from '../../user/services/user.sql.service';
import { MODULE_NAME, UserOTPType, UserTokenType } from '../auth.constant';
import {
    IActivateUserDTO,
    IForgotPasswordDTO,
    ILoginBody,
    IRegisterUserDTO,
    IResendOTPDTO,
    IResetPassword,
    IUpdatePasswordDTO,
    IUpdateUserProfileBody,
    IVerifyForgotPasswordOTP,
} from '../auth.interface';
import {
    activateUserSchema,
    forgotPasswordSchema,
    getGoogleLoginUrlQuerySchema,
    loginBodySchema,
    registerUserSchema,
    resendOTPSchema,
    resetPasswordSchema,
    updatePasswordSchema,
    updateUserProfileSchema,
    verifyForgotPasswordOTPSchema,
} from '../auth.validator';
import { AuthGoogleService } from '../services/auth.google.service';
import { AuthLoginService } from '../services/auth.login.service';
import { AuthSqlService } from '../services/auth.sql.service';
import {
    userListAttributes,
    userProfileAttributes,
    UserStatus,
} from '@/modules/user/user.constant';
import { ProductWishListQuerySchema } from '@/modules/product/product.validator';
import { ICommonListQuery } from '@/common/interfaces';
import { IUpdateUserProfileDTO } from '@/modules/user/user.interface';

@Controller('/app/auth')
// @UseGuards(AuthenticationGuard)
export class AuthAppController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly authSqlService: AuthSqlService,
        private readonly userSqlService: UserSqlService,
        private readonly authGoogleService: AuthGoogleService,
        private readonly loginService: AuthLoginService,
        private readonly jwtService: JwtService,
        private readonly sendGridService: SendGridService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get('/google-login-url')
    async requestSocialLoginUrl(
        @Query(new JoiValidationPipe(getGoogleLoginUrlQuerySchema)) query,
    ) {
        try {
            const loginUrl = this.authGoogleService.getGoogleLoginUrl(query);

            if (!loginUrl) {
                return new ErrorResponse(
                    HttpStatus.UNAUTHORIZED,
                    this.i18n.t('auth.error.invalidLoginInfo'),
                    [],
                );
            }
            return new SuccessResponse({ loginUrl });
        } catch (error) {
            this.logger.error(`Error in requestSocialLoginUrl API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/login')
    async login(
        @Body(new TrimBodyPipe(), new JoiValidationPipe(loginBodySchema))
        body: ILoginBody,
    ) {
        try {
            const authenticateResult = await this.loginService.authenticate(
                body,
            );
            if (!authenticateResult.success) {
                return new ErrorResponse(
                    HttpStatus.UNAUTHORIZED,
                    authenticateResult.errorMessage,
                    [],
                );
            }
            const accessToken = this.loginService.generateAccessToken(
                authenticateResult.user,
            );
            const hashToken = this.loginService.generateHashToken(
                authenticateResult.user?.id,
            );
            const refreshToken = this.loginService.generateRefreshToken(
                authenticateResult.user,
                hashToken,
            );
            await this.authSqlService.createUserToken({
                token: refreshToken.token,
                type: UserTokenType.REFRESH_TOKEN,
                hashToken,
                deletedAt: dayjs()
                    .add(refreshToken.expiresIn, 'seconds')
                    .format(
                        DateFormat.YYYY_MM_DD_HYPHEN_HH_mm_ss_COLON,
                    ) as unknown as Date,
                userId: authenticateResult.user.id,
                createdBy: authenticateResult.user.id,
            });
            return new SuccessResponse({
                profile: authenticateResult.user,
                accessToken,
                refreshToken,
            });
        } catch (error) {
            this.logger.error(`Error in login API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @UseGuards(AuthenticationGuard)
    @Patch('/password')
    async changePassword(
        @Req() req,
        @Body(new JoiValidationPipe(updatePasswordSchema))
        body: IUpdatePasswordDTO,
    ) {
        try {
            const { loginUser } = req;
            const user = await this.userSqlService.getUserById(loginUser.id, [
                'id',
                'password',
            ]);

            const isPasswordCorrect = await compareSync(
                body.password,
                user.password,
            );

            if (!isPasswordCorrect) {
                return new ErrorResponse(HttpStatus.UNAUTHORIZED);
            }

            await this.authSqlService.updatePassword(user.id, body.newPassword);
            return new SuccessResponse({});
        } catch (error) {
            this.logger.error(`Error in changePassword API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/refresh-token')
    async refreshToken(@Req() req) {
        try {
            const token = extractToken(req.headers.authorization || '');
            if (!token) {
                const message = await this.i18n.translate('errors.401');
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message, []);
            }
            const user = await this.jwtService.verify(token, {
                secret: this.configService.get(
                    ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY,
                ),
                ignoreExpiration: false,
            });
            const { id, hashToken } = user;
            // check hashToken, user exist?
            const [isHashTokenExist, loginUser] = await Promise.all([
                this.authSqlService.checkHashTokenExist(hashToken),
                this.userSqlService.getUserById(id, userListAttributes),
            ]);
            if (!isHashTokenExist) {
                const message = await this.i18n.translate(
                    'auth.refreshToken.errors.hashTokenInvalid',
                );
                return new ErrorResponse(HttpStatus.UNAUTHORIZED, message, []);
            }
            if (!loginUser) {
                const message = await this.i18n.translate(
                    'auth.refreshToken.errors.userNotFound',
                );
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    message,
                    [],
                );
            }
            const accessToken =
                this.loginService.generateAccessToken(loginUser);
            const newHashToken = this.loginService.generateHashToken(
                loginUser.id,
            );
            const refreshToken = this.loginService.generateRefreshToken(
                loginUser,
                newHashToken,
            );

            await this.authSqlService.createUserToken({
                token: refreshToken.token,
                type: UserTokenType.REFRESH_TOKEN,
                hashToken: newHashToken,
                deletedAt: dayjs()
                    .add(refreshToken.expiresIn, 'seconds')
                    .format(
                        DateFormat.YYYY_MM_DD_HYPHEN_HH_mm_ss_COLON,
                    ) as unknown as Date,
                userId: loginUser.id,
                createdBy: loginUser.id,
            });
            return new SuccessResponse({
                profile: loginUser,
                accessToken,
                refreshToken,
            });
        } catch (error) {
            this.logger.error(`Error in refreshToken API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Patch('/reset-password')
    async resetPassword(
        @Body(new JoiValidationPipe(resetPasswordSchema))
        body: IResetPassword,
    ) {
        try {
            const { email, password, otp } = body;
            const user = await this.userSqlService.getUserByField(
                'email',
                email,
                [...userListAttributes, 'password'],
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('auth.userNotFound'),
                    [],
                );
            }

            const otpValid = await this.loginService.verifyOTPCode(
                user.id,
                otp,
                UserOTPType.RESET_PASSWORD,
            );

            if (!otpValid) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            key: 'otp',
                            message: this.i18n.t(
                                'auth.forgotPassword.invalidOTP',
                            ),
                            errorCode: HttpStatus.UNAUTHORIZED,
                        },
                    ],
                );
            }

            await Promise.all([
                this.loginService.updatePasswordById(user.id, password),
                this.loginService.deleteOTP(
                    user.id,
                    UserOTPType.RESET_PASSWORD,
                ),
            ]);

            return new SuccessResponse({});
        } catch (error) {
            this.logger.error(`Error in resetPassword API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/forgot-password/verify')
    async verifyForgotPasswordOTP(
        @Body(new JoiValidationPipe(verifyForgotPasswordOTPSchema))
        body: IVerifyForgotPasswordOTP,
    ) {
        try {
            const { email, otp } = body;
            const user = await this.userSqlService.getUserByField(
                'email',
                email,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('auth.userNotFound'),
                    [],
                );
            }

            const otpValid = await this.loginService.verifyOTPCode(
                user.id,
                otp,
                UserOTPType.RESET_PASSWORD,
                false,
            );

            if (otpValid) {
                await this.loginService.updateOTPStatus(
                    user.id,
                    otp,
                    UserOTPType.RESET_PASSWORD,
                );
                return new SuccessResponse({});
            }

            return new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                this.i18n.t('errors.400'),
                [
                    {
                        key: 'otp',
                        message: this.i18n.t('auth.forgotPassword.invalidOTP'),
                        errorCode: HttpStatus.UNAUTHORIZED,
                    },
                ],
            );
        } catch (error) {
            this.logger.error(`Error in verifyForgotPasswordOTP API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/forgot-password')
    async forgotPassword(
        @Body(new JoiValidationPipe(forgotPasswordSchema))
        body: IForgotPasswordDTO,
    ) {
        try {
            const { email } = body;
            const user = await this.userSqlService.getUserByField(
                'email',
                email,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('auth.userNotFound'),
                    [],
                );
            }

            const otpExists = await this.loginService.checkOTPExists(
                user.id,
                UserOTPType.RESET_PASSWORD,
            );

            if (otpExists) {
                await this.loginService.deleteOTP(
                    user.id,
                    UserOTPType.RESET_PASSWORD,
                );
            }

            const otp = await this.loginService.generateOTP(
                user.id,
                UserOTPType.RESET_PASSWORD,
            );

            this.loginService.sendForgotPasswordEmail(user.email, otp);

            return new SuccessResponse({});
        } catch (error) {
            this.logger.error(`Error in forgotPassword API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/send-otp')
    async sendOTPCode(
        @Body(new JoiValidationPipe(resendOTPSchema))
        body: IResendOTPDTO,
    ) {
        try {
            const { email } = body;
            const user = await this.userSqlService.getUserByField(
                'email',
                email,
                ['id', 'email', 'name', 'status'],
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }

            if (
                user.status === UserStatus.ACTIVE &&
                body.type === UserOTPType.REGISTER_USER
            ) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [],
                );
            }

            const otpExists = await this.loginService.checkOTPExists(
                user.id,
                body.type,
            );

            if (otpExists) {
                await this.loginService.deleteOTP(user.id, body.type);
            }

            const otp = await this.loginService.generateOTP(user.id, body.type);

            switch (body.type) {
                case UserOTPType.REGISTER_USER: {
                    this.loginService.sendRegisterUserEmail(
                        user.email,
                        otp,
                        user.name,
                    );
                    break;
                }
                case UserOTPType.RESET_PASSWORD: {
                    this.loginService.sendForgotPasswordEmail(user.email, otp);
                    break;
                }
                default: {
                    break;
                }
            }

            return new SuccessResponse({});
        } catch (error) {
            this.logger.error(`Error in resendOTPCode API, ${error}`);
        }
    }

    @Post('/register/active')
    async activateUser(
        @Body(new TrimBodyPipe(), new JoiValidationPipe(activateUserSchema))
        body: IActivateUserDTO,
    ) {
        try {
            const { email, otp } = body;
            const user = await this.userSqlService.getUserByField(
                'email',
                email,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }

            const otpValid = await this.loginService.verifyOTPCode(
                user.id,
                otp,
                UserOTPType.REGISTER_USER,
                false,
            );

            if (otpValid) {
                await this.authSqlService.activateUser(user.id, otp);
                return new SuccessResponse({});
            }

            return new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                this.i18n.t('errors.400'),
                [
                    {
                        key: 'otp',
                        message: this.i18n.t('auth.forgotPassword.invalidOTP'),
                        errorCode: HttpStatus.UNAUTHORIZED,
                    },
                ],
            );
        } catch (error) {
            this.logger.error(`Error in activateUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/register')
    async registerUser(
        @Body(new TrimBodyPipe(), new JoiValidationPipe(registerUserSchema))
        body: IRegisterUserDTO,
    ) {
        try {
            const user = await this.userSqlService.getUserByField(
                'email',
                body.email,
                ['id'],
            );
            if (user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_ALREADY_EXIST,
                    this.i18n.t('user.error.emailAlreadyExists'),
                );
            }

            const otp = await this.loginService.registerUser(body);

            this.loginService.sendRegisterUserEmail(body.email, otp, body.name);

            return new SuccessResponse({});
        } catch (error) {
            this.logger.error(`Error in registerUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Get('/profile/wishlist')
    @UseGuards(AuthenticationGuard)
    async getCustomerProductWishList(
        @Req() req,
        @Query(new JoiValidationPipe(ProductWishListQuerySchema))
        query: ICommonListQuery,
    ) {
        try {
            const loginUser = req.loginUser;
            const data = await this.authSqlService.getProductWishList({
                ...query,
                userId: loginUser.id,
            });
            return new SuccessResponse(data);
        } catch (error) {
            this.logger.error(
                `Error in getCustomerProductWishList API, ${error}`,
            );
            return new InternalServerErrorException(error);
        }
    }

    @Get('/profile')
    @UseGuards(AuthenticationGuard)
    async getUserProfile(@Req() req) {
        try {
            const loginUser = req.loginUser;
            const profile = await this.authSqlService.getUserProfile(
                loginUser.id,
                userProfileAttributes,
            );
            return new SuccessResponse(profile);
        } catch (error) {
            this.logger.error(`Error in getUserProfile API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Patch('/profile')
    @UseGuards(AuthenticationGuard)
    async updateProfile(
        @Req() req,
        @Body(new JoiValidationPipe(updateUserProfileSchema))
        body: IUpdateUserProfileDTO,
    ) {
        try {
            const loginUser = req.loginUser;
            // TODO check file exists

            const updatedProfile = await this.userSqlService.updateUser(
                loginUser.id,
                body,
                userProfileAttributes,
            );
            return new SuccessResponse(updatedProfile);
        } catch (error) {
            this.logger.error(`Error in updateProfile API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
