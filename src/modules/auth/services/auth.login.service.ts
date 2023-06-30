import ConfigKey from '@/common/config/config-key';
import { UserSqlService } from '@/modules/user/services/user.sql.service';
import jwt from 'jsonwebtoken';
import { compareSync, hashSync } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from '../../../common/services/winston.service';
import { AuthProvider, MODULE_NAME, UserOTPType } from '../auth.constant';
import { ILoginBody, IRegisterUserDTO } from '../auth.interface';
import { AuthGoogleService } from './auth.google.service';
import { AuthSqlService } from './auth.sql.service';
import { I18nService } from 'nestjs-i18n';

import { userListAttributes, UserStatus } from '@/modules/user/user.constant';
import { User } from '@/mysql-entity/user.entity';
import { SendGridService } from '@/modules/common/services/sendgrid.service';
import { MailDataRequired } from '@sendgrid/mail';
import { UserOTP } from '@/mysql-entity/user-otp.entity';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from '@/common/helpers/commonFunctions';
import dayjs from 'dayjs';
interface IAuthenticateResult {
    success: boolean;
    errorMessage?: string;
    user?: User;
}

@Injectable()
export class AuthLoginService {
    constructor(
        private readonly configService: ConfigService,
        private readonly authSqlService: AuthSqlService,
        private readonly authGoogleService: AuthGoogleService,
        private readonly userSqlService: UserSqlService,
        private readonly i18n: I18nService,
        private readonly sendGridService: SendGridService,
        @InjectRepository(UserOTP)
        private readonly userOTPRepository: Repository<UserOTP>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async authenticate(body: ILoginBody): Promise<IAuthenticateResult> {
        let authenticateResult;
        switch (body.provider) {
            case AuthProvider.EMAIL:
                authenticateResult = await this.authenticateByEmail(
                    body.email,
                    body.password,
                );
                break;
            case AuthProvider.GOOGLE:
                authenticateResult = await this.authenticateByGoogle(
                    body.token,
                    body.redirectUri,
                );
                break;
            default:
                return {
                    success: false,
                    errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
                };
        }
        return authenticateResult;
    }

    async authenticateByEmail(
        email: string,
        password: string,
    ): Promise<IAuthenticateResult> {
        try {
            const user = await this.userSqlService.getUserByField(
                'email',
                email,
                [...userListAttributes, 'password'],
            );

            if (user.status === UserStatus.REGISTERING) {
                return {
                    success: false,
                    errorMessage: this.i18n.t('errors.401'),
                };
            }

            if (!user || !password || !compareSync(password, user.password)) {
                return {
                    success: false,
                    errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
                };
            }
            delete user.password;

            return {
                success: true,
                user: user,
            };
        } catch (error) {
            this.logger.error('Error in authenticateByEmail: ', error);
            return {
                success: false,
                errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
            };
        }
    }

    async authenticateByGoogle(
        token: string,
        redirectUri: string,
    ): Promise<IAuthenticateResult> {
        try {
            const verifyResult = await this.authGoogleService.verifyGoogleToken(
                token,
                redirectUri,
            );
            if (!verifyResult?.success) {
                return {
                    success: false,
                    errorMessage: verifyResult.errorMessage,
                };
            }
            const user = await this.userSqlService.getUserByField(
                'email',
                [...userListAttributes, 'password'],
                verifyResult.googleData?.email,
            );
            if (!user) {
                return {
                    success: false,
                    errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
                };
            }
            return {
                success: true,
                user,
            };
        } catch (error) {
            this.logger.error('Error in authenticateByGoogle: ', error);
            return {
                success: false,
                errorMessage: this.i18n.t('auth.error.invalidLoginInfo'),
            };
        }
    }

    generateAccessToken(user: User) {
        const accessTokenExpiredIn = this.configService.get(
            ConfigKey.JWT_ACCESS_TOKEN_EXPIRED_IN,
        );

        const tokenPrivateKey = this.configService
            .get(ConfigKey.JWT_ACCESS_TOKEN_SECRET_KEY)
            .replace(/\\n/g, '\n');
        const payloadToken = {
            id: user.id,
            email: user.email,
            name: user.name,
            expiresIn: accessTokenExpiredIn,
        };
        const accessToken = jwt.sign(payloadToken, tokenPrivateKey, {
            expiresIn: accessTokenExpiredIn,
        });
        return {
            token: accessToken,
            expiresIn: accessTokenExpiredIn,
        };
    }

    generateRefreshToken(user: User, hashToken: string) {
        const refreshTokenExpiredIn = this.configService.get(
            ConfigKey.JWT_REFRESH_TOKEN_EXPIRED_IN,
        );
        const tokenPrivateKey = this.configService
            .get(ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY)
            .replace(/\\n/g, '\n');

        const payloadToken = {
            id: user.id,
            email: user.email,
            name: user.name,
            expiresIn: refreshTokenExpiredIn,
            hashToken,
        };
        const refreshToken = jwt.sign(payloadToken, tokenPrivateKey, {
            expiresIn: refreshTokenExpiredIn,
        });
        return {
            token: refreshToken,
            expiresIn: refreshTokenExpiredIn,
        };
    }

    generateHashToken(userId: number): string {
        return `${userId}-${Date.now()}`;
    }

    async verifyOTPCode(
        userId: number,
        otp: string,
        type: UserOTPType,
        isVerified = true,
    ) {
        try {
            const now = new Date();
            const otpRecord = await this.userOTPRepository.findOne({
                where: [
                    {
                        deletedAt: IsNull(),
                        expiredAt: MoreThan(now),
                        isVerified,
                        userId,
                        type,
                    },
                    {
                        deletedAt: MoreThan(now),
                        expiredAt: MoreThan(now),
                        isVerified,
                        userId,
                        type,
                    },
                ],
            });

            return otpRecord?.value == otp;
        } catch (error) {
            this.logger.error(`Error in verifyOTPCode service ${error}`);
            throw error;
        }
    }

    async checkOTPExists(userId: number, type: UserOTPType) {
        try {
            const now = new Date();
            return await this.userOTPRepository.exist({
                where: [
                    {
                        deletedAt: IsNull(),
                        expiredAt: MoreThan(now),
                        isVerified: false,
                        userId,
                        type,
                    },
                    {
                        deletedAt: MoreThan(now),
                        expiredAt: MoreThan(now),
                        isVerified: false,
                        userId,
                        type,
                    },
                ],
            });
        } catch (error) {
            this.logger.error(`Error in checkOTPExists service ${error}`);
            throw error;
        }
    }

    async updateOTPStatus(userId: number, otp: string, type: UserOTPType) {
        try {
            return await this.userOTPRepository.update(
                {
                    userId,
                    value: otp,
                    type,
                },
                {
                    isVerified: true,
                },
            );
        } catch (error) {
            this.logger.error(`Error in updateOTPStatus service ${error}`);
            throw error;
        }
    }

    async generateOTP(
        userId: number,
        type: UserOTPType,
        userOTPRepository: Repository<UserOTP> = this.userOTPRepository,
    ) {
        try {
            const randomOTP = Math.random().toString().slice(2, 8);
            const expiredAt = dayjs()
                .add(
                    +this.configService.get(
                        ConfigKey.RESET_PASSWORD_OTP_EXPIRED_IN,
                    ),
                    'seconds',
                )
                .toDate();
            await userOTPRepository.save({
                type,
                value: randomOTP,
                userId,
                isVerified: false,
                expiredAt: expiredAt,
                deletedAt: expiredAt,
            });

            return randomOTP;
        } catch (error) {
            this.logger.error(`Error in generateOTP service ${error}`);
            throw error;
        }
    }

    async registerUser(data: IRegisterUserDTO) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();
            const userOTPRepository =
                queryRunner.manager.getRepository(UserOTP);
            const saveResult = await queryRunner.manager
                .getRepository(User)
                .save({
                    ...data,
                    repeatPassword: undefined,
                    password: hashSync(data.password, 10),
                });
            const otp = await this.generateOTP(
                saveResult.id,
                UserOTPType.REGISTER_USER,
                userOTPRepository,
            );
            await queryRunner.commitTransaction();

            return otp;
        } catch (error) {
            this.logger.error(`Error in registerUser service ${error}`);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            queryRunner.release();
        }
    }

    async deleteOTP(userId: number, type: UserOTPType) {
        try {
            return await this.userOTPRepository.update(
                {
                    userId,
                    deletedAt: MoreThan(new Date()),
                    type,
                },
                {
                    deletedAt: new Date(),
                },
            );
        } catch (error) {
            this.logger.error(`Error in deleteOTP service ${error}`);
            throw error;
        }
    }

    async sendForgotPasswordEmail(email: string, otp: string) {
        try {
            await this.sendGridService.send({
                subject: this.i18n.t('auth.forgotPassword.subject'),
                to: email,
                from: this.configService.get(ConfigKey.SENDGRID_SENDER_EMAIL),
                html: this.i18n.t('auth.forgotPassword.emailContent', {
                    args: {
                        value: otp,
                        expiredIn:
                            +this.configService.get(
                                ConfigKey.RESET_PASSWORD_OTP_EXPIRED_IN,
                            ) / 60,
                    },
                }),
            });
        } catch (error) {
            this.logger.error(
                `Error in sendForgotPasswordEmail service ${error}`,
            );
            throw error;
        }
    }

    async sendRegisterUserEmail(email: string, otp: string, fullName: string) {
        try {
            await this.sendGridService.send({
                subject: this.i18n.t('auth.registerUser.subject'),
                to: email,
                from: this.configService.get(ConfigKey.SENDGRID_SENDER_EMAIL),
                html: this.i18n.t('auth.registerUser.emailContent', {
                    args: {
                        value: otp,
                        fullName,
                        expiredIn:
                            +this.configService.get(
                                ConfigKey.REGISTER_USER_OTP_EXPIRED_IN,
                            ) / 60,
                    },
                }),
            });
        } catch (error) {
            this.logger.error(
                `Error in sendRegisterUserEmail service ${error}`,
            );
            throw error;
        }
    }

    async updatePasswordById(id: number, password: string) {
        try {
            return await this.userRepository.update(
                {
                    id,
                },
                {
                    password: hashPassword(password),
                },
            );
        } catch (error) {
            this.logger.error(`Error in updatePasswordById service ${error}`);
            throw error;
        }
    }
}
