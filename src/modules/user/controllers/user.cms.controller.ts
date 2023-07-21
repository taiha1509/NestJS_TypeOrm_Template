import { HttpStatus } from '../../../common/constants';
import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Post,
    Param,
    Delete,
    Patch,
    Query,
    UseGuards,
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UserSqlService } from '../services/user.sql.service';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import {
    createAdminUserSchema,
    createUserSchema,
    updateAdminUserSchema,
    updateCustomerSchema,
    updateUserProfileSchema,
    updateUserSchema,
    userListQuerySchema,
} from '../user.validator';
import {
    ICreateAdminUserDTO,
    IUpdateAdminUserDTO,
    IUpdateCustomerDTO,
    IUpdateUserProfileDTO,
    IUserCreateBody,
    IUserListQuery,
    IUserUpdateBody,
} from '../user.interface';
import {
    MODULE_NAME,
    SystemRole,
    UserField,
    userListAttributes,
    userProfileAttributes,
    UserRole,
    UserStatus,
} from '../user.constant';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { createWinstonLogger } from '@/common/services/winston.service';
import { TrimBodyPipe } from '@/common/pipe/trim.body.pipe';
import {
    activateUserSchema,
    registerUserSchema,
} from '@/modules/auth/auth.validator';
import {
    IActivateUserDTO,
    IRegisterUserDTO,
} from '@/modules/auth/auth.interface';
import { AuthLoginService } from '@/modules/auth/services/auth.login.service';
import { UserOTPType } from '@/modules/auth/auth.constant';
import { AuthSqlService } from '@/modules/auth/services/auth.sql.service';
import { UserCmsSqlService } from '../services/user.cms.sql.service';
import { intersection } from 'lodash';
import { idSchema } from '@/modules/common/common.validator';
import { Roles } from '@/common/helpers/commonFunctions';

@Controller('/cms/user')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class UserCmsController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly userService: UserSqlService,
        private readonly userCmsService: UserCmsSqlService,
        private readonly loginService: AuthLoginService,
        private readonly authSqlService: AuthSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get('/customer')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    async getCustomerList(
        @Query(new JoiValidationPipe(userListQuerySchema))
        query: IUserListQuery,
        @Req() req,
    ) {
        try {
            query.roles = [UserRole.CUSTOMER];
            const data = await this.userCmsService.getUserList(query);
            return new SuccessResponse(data);
        } catch (error) {
            this.logger.error(`Error in getCustomerList API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Get('/')
    @Roles(UserRole.SUPER_ADMIN)
    async getAdminUserList(
        @Query(new JoiValidationPipe(userListQuerySchema))
        query: IUserListQuery,
        @Req() req,
    ) {
        try {
            query.roles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
            const data = await this.userCmsService.getUserList(query);
            return new SuccessResponse(data);
        } catch (error) {
            this.logger.error(`Error in getAdminUserList API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/')
    @Roles(UserRole.SUPER_ADMIN)
    async createAdminUser(
        @Body(new JoiValidationPipe(createAdminUserSchema))
        body: ICreateAdminUserDTO,
        @Req() req,
    ) {
        try {
            if (body.avatarId) {
                const avatarExist = await this.userCmsService.checkFileExist(
                    body.avatarId,
                );
                if (!avatarExist) {
                    return new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        this.i18n.t('errors.400'),
                        [
                            {
                                key: 'avatarId',
                                errorCode: HttpStatus.ITEM_NOT_FOUND,
                                message: this.i18n.t('file.fileNotFound'),
                            },
                        ],
                    );
                }
            }
            const emailExist = await this.userCmsService.checkUserExistByEmail(
                body.email,
            );
            if (emailExist) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            key: 'email',
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                            message: this.i18n.t(
                                'user.error.emailAlreadyExists',
                            ),
                        },
                    ],
                );
            }
            body.createdBy = req.loginUser?.id;

            const userId = await this.userCmsService.createAdminUser(body);
            return new SuccessResponse({ id: userId });
        } catch (error) {
            this.logger.error(`Error in createAdminUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    async getUserDetail(
        @Param('id', new JoiValidationPipe(idSchema)) id: number,
        @Req() req,
    ) {
        try {
            const user = await this.userCmsService.getUserDetail(id);
            if (!user)
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    this.i18n.t('errors.404'),
                );
            if (
                ([UserStatus.REGISTERING, UserStatus.DEACTIVATED].includes(
                    user.status,
                ) ||
                    [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(
                        user.role,
                    )) &&
                req.loginUser.role !== UserRole.SUPER_ADMIN
            ) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.403'),
                    [
                        {
                            key: 'role',
                            errorCode: HttpStatus.FORBIDDEN,
                            message: this.i18n.t('user.error.doNotAllowAction'),
                        },
                    ],
                );
            }
            return new SuccessResponse(user);
        } catch (error) {
            this.logger.error(`Error in getUserDetail API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Patch('/:id')
    @Roles(UserRole.SUPER_ADMIN)
    async updateAdminUser(
        @Param('id', new JoiValidationPipe(idSchema)) id: number,
        @Body(new JoiValidationPipe(updateAdminUserSchema))
        body: IUpdateAdminUserDTO,
        @Req() req,
    ) {
        try {
            if (body.avatarId) {
                const avatarExist = await this.userCmsService.checkFileExist(
                    body.avatarId,
                );
                if (!avatarExist) {
                    return new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        this.i18n.t('errors.400'),
                        [
                            {
                                key: 'avatarId',
                                errorCode: HttpStatus.ITEM_NOT_FOUND,
                                message: this.i18n.t('file.fileNotFound'),
                            },
                        ],
                    );
                }
            }
            body.updatedBy = req.loginUser.id;
            const adminUser = await this.userCmsService.updateAdminUser(
                id,
                body,
            );
            return new SuccessResponse(adminUser);
        } catch (error) {
            this.logger.error(`Error in updateAdminUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Patch('/customer/:id')
    async updateCustomer(
        @Param('id', new JoiValidationPipe(idSchema)) id: number,
        @Body(new JoiValidationPipe(updateCustomerSchema))
        body: IUpdateCustomerDTO,
        @Req() req,
    ) {
        try {
            const customerExist =
                await this.userCmsService.checkCustomerExistByIdAndRole(id, [
                    UserRole.CUSTOMER,
                ]);
            if (!customerExist)
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    this.i18n.t('errors.404'),
                );
            body.updatedBy = req.loginUser.id;
            const customer = await this.userCmsService.updateCustomer(id, body);
            return new SuccessResponse(customer);
        } catch (error) {
            this.logger.error(`Error in updateCustomer API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Delete('/:id')
    @Roles(UserRole.SUPER_ADMIN)
    async deleteAdminUser(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        id: number,
        @Req() req,
    ) {
        try {
            const adminExist =
                await this.userCmsService.checkCustomerExistByIdAndRole(id, [
                    UserRole.ADMIN,
                    UserRole.SUPER_ADMIN,
                ]);
            if (!adminExist)
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    this.i18n.t('errors.404'),
                );
            if (id === req.loginUser?.id) {
                return new ErrorResponse(
                    HttpStatus.ITEM_INVALID,
                    this.i18n.t('user.error.userDeleteMySelf'),
                );
            }
            await this.userCmsService.deleteUserById(id, req.loginUser?.id);
            return new SuccessResponse({ id });
        } catch (error) {
            this.logger.error(`Error in deleteAdminUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Delete('/customer/:id')
    async deleteCustomer(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        id: number,
        @Req() req,
    ) {
        try {
            const customerExist =
                await this.userCmsService.checkCustomerExistByIdAndRole(id, [
                    UserRole.CUSTOMER,
                ]);
            if (!customerExist)
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    this.i18n.t('errors.404'),
                );
            if (id === req.loginUser?.id) {
                return new ErrorResponse(
                    HttpStatus.ITEM_INVALID,
                    this.i18n.t('user.error.userDeleteMySelf'),
                );
            }
            await this.userCmsService.deleteUserById(id, req.loginUser?.id);
            return new SuccessResponse({ id });
        } catch (error) {
            this.logger.error(`Error in deleteCustomer API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
