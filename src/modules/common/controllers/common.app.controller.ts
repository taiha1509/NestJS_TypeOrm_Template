import ConfigKey from '@/common/config/config-key';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { SuccessResponse } from '@/common/helpers/response';
import { createWinstonLogger } from '@/common/services/winston.service';
import {
    Controller,
    Get,
    InternalServerErrorException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { CategorySqlService } from '../../category/services/category.sql.service';
import { UserSqlService } from '../../user/services/user.sql.service';
import { MODULE_NAME } from '../common.constant';

@Controller('/app/common')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CommonAppController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly userSqlService: UserSqlService,
        private readonly categoryService: CategorySqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get('/dropdown/user')
    async getAllUser() {
        try {
            const users = await this.userSqlService.getAllUsers([
                'id',
                'name',
                'systemRole',
                'email',
            ]);
            return new SuccessResponse(users);
        } catch (error) {
            this.logger.error(`Error in getAllUser API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Get('/dropdown/category')
    async getAllCategories() {
        try {
            const categories = await this.categoryService.getAllCategories();
            return new SuccessResponse(categories);
        } catch (error) {
            this.logger.error(`Error in getAllCategories API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Get('/general-information')
    async getGeneralInformation() {
        try {
            const categories = await this.categoryService.getAllCategories();
            return new SuccessResponse({
                categories,
                apiVersion: this.configService.get(ConfigKey.VERSION),
            });
        } catch (error) {
            this.logger.error(`Error in getGeneralInformation API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
