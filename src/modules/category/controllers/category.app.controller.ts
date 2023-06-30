import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { CategorySqlService } from '../services/category.sql.service';
import { categoryListQuerySchema } from '../category.validator';
import { ICategoryListQuery } from '../category.interface';
import { createWinstonLogger } from '@/common/services/winston.service';
import { MODULE_NAME } from '../category.constant';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('/app/category')
export class ProductAppController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly categoryService: CategorySqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get('/')
    async getCategoryList(
        @Query(new JoiValidationPipe(categoryListQuerySchema))
        query: ICategoryListQuery,
    ) {
        try {
            const data = await this.categoryService.getCategoryList(query);
            return new SuccessResponse(data);
        } catch (error) {
            this.logger.error(`Error in getCategoryList API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
