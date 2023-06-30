import { CommonListQuerySchema, HttpStatus } from '../../../common/constants';
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
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { ProductSqlService } from '../services/product.sql.service';
import { productListQuerySchema } from '../product.validator';
import { IProductListQuery } from '../product.interface';
import { idSchema } from '@/modules/common/common.validator';
import { createWinstonLogger } from '@/common/services/winston.service';
import { MODULE_NAME } from '../product.constant';
import { ICommonListQuery } from '@/common/interfaces';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('/app/product')
export class ProductAppController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly productService: ProductSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get('/')
    async getProductList(
        @Query(new JoiValidationPipe(productListQuerySchema))
        query: IProductListQuery,
    ) {
        try {
            const data = await this.productService.getProductList(query);
            return new SuccessResponse(data);
        } catch (error) {
            this.logger.error(`Error in getProductList API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Get('/:id')
    async getProductDetail(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        id: number,
    ) {
        try {
            const data = await this.productService.getProductById(id);
            if (!data) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('product.productNotFound'),
                );
            }
            return new SuccessResponse(data);
        } catch (error) {
            this.logger.error(`Error in getProductDetail API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
