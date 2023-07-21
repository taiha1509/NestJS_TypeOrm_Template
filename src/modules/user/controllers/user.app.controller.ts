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
}
