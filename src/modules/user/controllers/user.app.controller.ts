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
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { UserSqlService } from '../services/user.sql.service';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import {
    createUserSchema,
    updateUserProfileSchema,
    updateUserSchema,
    userListQuerySchema,
} from '../user.validator';
import {
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

@Controller('/app/user')
export class UserAppController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly userService: UserSqlService,
        private readonly loginService: AuthLoginService,
        private readonly authSqlService: AuthSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get()
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    async getUserList(
        @Query(new JoiValidationPipe(userListQuerySchema))
        query: IUserListQuery,
    ) {
        try {
            const data = await this.userService.getUserList(query);
            return new SuccessResponse(data);
        } catch (error) {
            this.logger.error(`Error in getUserList API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Get(':id')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    async getUserDetail(@Param() params: { id: number }) {
        try {
            const user = await this.userService.getUserById(
                params.id,
                userListAttributes,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }
            return new SuccessResponse(user);
        } catch (error) {
            this.logger.error(`Error in getUserDetail API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post()
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    async createUser(
        @Body(new JoiValidationPipe(createUserSchema)) body: IUserCreateBody,
    ) {
        try {
            const oldUser = await this.userService.getUserByField(
                UserField.EMAIL,
                body.email,
                userListAttributes,
            );
            if (oldUser) {
                return new ErrorResponse(
                    HttpStatus.ITEM_ALREADY_EXIST,
                    this.i18n.t('user.error.userAlreadyExist'),
                    [],
                );
            }
            const newUser = await this.userService.createUser(body);
            return new SuccessResponse(newUser);
        } catch (error) {
            this.logger.error(`Error in createUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Patch(':id')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    async updateUser(
        @Body(new JoiValidationPipe(updateUserSchema))
        body: IUserUpdateBody,
        @Param() params: { id: number },
    ) {
        try {
            const user = await this.userService.getUserById(
                params.id,
                userListAttributes,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }

            const updateUser = await this.userService.updateUser(
                params.id,
                body,
            );

            return new SuccessResponse(updateUser);
        } catch (error) {
            this.logger.error(`Error in updateUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Delete(':id')
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    async deleteUser(@Param() params: { id: number }, @Req() req) {
        try {
            const user = await this.userService.getUserById(
                params.id,
                userListAttributes,
            );
            if (!user) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('user.error.userNotFound'),
                    [],
                );
            }

            const { loginUser } = req;

            if (loginUser.id === params.id) {
                return new ErrorResponse(
                    HttpStatus.FORBIDDEN,
                    this.i18n.t('user.error.userDeleteMySelf'),
                    [],
                );
            }
            await this.userService.deleteUser(params.id, loginUser.id);
            return new SuccessResponse({
                id: params.id,
                deletedBy: loginUser.id,
            });
        } catch (error) {
            this.logger.error(`Error in deleteUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
