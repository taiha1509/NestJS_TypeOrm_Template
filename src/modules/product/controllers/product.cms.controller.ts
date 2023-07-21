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
import { ErrorResponse, SuccessResponse } from '@/common/helpers/response';
import { JoiValidationPipe } from '@/common/pipe/joi.validation.pipe';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { ProductSqlService } from '../services/product.sql.service';
import {
    createProductBodySchema,
    FeedbackProductSchema,
    productListQuerySchema,
    updateProductBodySchema,
} from '../product.validator';
import {
    ICreateProductDTO,
    IProductListQuery,
    IUpdateProductDTO,
    IUserFeedbackProductDTO,
} from '../product.interface';
import { idSchema } from '@/modules/common/common.validator';
import { createWinstonLogger } from '@/common/services/winston.service';
import { MODULE_NAME } from '../product.constant';
import { ICommonListQuery } from '@/common/interfaces';
import { ProductFeedbackSqlService } from '../services/product.feedback.sql.service';
import { ProductCmsSqlService } from '../services/product.cms.sql.service';
import { UserRole } from '@/modules/user/user.constant';
import { Roles } from '@/common/helpers/commonFunctions';

// TODO required admin here
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('/cms/product')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class ProductCmsController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly productService: ProductSqlService,
        private readonly productFeedbackService: ProductFeedbackSqlService,
        private readonly productCmsService: ProductCmsSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Post('/')
    async createProduct(
        @Body(new JoiValidationPipe(createProductBodySchema))
        body: ICreateProductDTO,
        @Req() req,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            // check categoryIds
            const categoryIdsValid =
                await this.productCmsService.checkCategoryIdsValid(
                    body.categoryIds,
                );

            if (!categoryIdsValid) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            key: 'categoryIds',
                            message: this.i18n.t('category.notFound'),
                        },
                    ],
                );
            }

            // check images
            const imageIdsValid =
                await this.productCmsService.checkCategoryIdsValid(
                    body.images?.map((image) => image.imageId),
                );
            if (!imageIdsValid) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            key: 'images.imageId',
                            message: this.i18n.t(''),
                            errorCode: HttpStatus.ITEM_INVALID,
                        },
                    ],
                );
            }

            const productId = await this.productCmsService.createProduct(body);
            return new SuccessResponse({ id: productId });
        } catch (error) {
            this.logger.error(`Error in createProduct API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Patch('/:id')
    async updateProduct(
        @Param('id', new ParseIntPipe()) productId: number,
        @Body(new JoiValidationPipe(updateProductBodySchema))
        body: IUpdateProductDTO,
        @Req() req,
    ) {
        try {
            body.updatedBy = req.loginUser.id;
            // check categoryIds
            const categoryIdsValid =
                await this.productCmsService.checkCategoryIdsValid(
                    body.categoryIds,
                );

            if (!categoryIdsValid) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            key: 'categoryIds',
                            message: this.i18n.t('category.notFound'),
                        },
                    ],
                );
            }

            // check images
            const imageIdsValid =
                await this.productCmsService.checkCategoryIdsValid(
                    body.images?.map((image) => image.imageId),
                );
            if (!imageIdsValid) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            key: 'images.imageId',
                            message: this.i18n.t(''),
                            errorCode: HttpStatus.ITEM_INVALID,
                        },
                    ],
                );
            }

            const product = await this.productCmsService.updateProduct(
                productId,
                body,
            );
            return new SuccessResponse(product);
        } catch (error) {
            this.logger.error(`Error in createProduct API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Delete('/:id')
    async deleteProduct(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        productId: number,
        @Req() req,
    ) {
        try {
            const userId = req.loginUser.id;
            // check product exists
            const productExist =
                await this.productService.checkProductExistById(productId);
            if (!productExist) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    this.i18n.t('errors.404'),
                );
            }

            await this.productCmsService.deleteProductById(productId, userId);

            return new SuccessResponse({ id: productId });
        } catch (error) {
            this.logger.error(`Error in createProduct API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
