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
import {
    addProductToWWishlistSchema,
    FeedbackProductSchema,
    productListQuerySchema,
} from '../product.validator';
import {
    IAddProductToWishlistDTO,
    IProductListQuery,
    IUserFeedbackProductDTO,
} from '../product.interface';
import { idSchema } from '@/modules/common/common.validator';
import { createWinstonLogger } from '@/common/services/winston.service';
import { MODULE_NAME } from '../product.constant';
import { ICommonListQuery } from '@/common/interfaces';
import { ProductFeedbackSqlService } from '../services/product.feedback.sql.service';

@Controller('/app/product')
export class ProductAppController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly productService: ProductSqlService,
        private readonly productFeedbackService: ProductFeedbackSqlService,
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
        @Req() req,
    ) {
        try {
            const data = await this.productService.getProductList(
                query,
                req.loginUser?.id,
            );
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
        @Req() req,
    ) {
        try {
            const data = await this.productService.getProductDetail(
                id,
                req.loginUser?.id,
            );
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

    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Post('/:id/feedback')
    async feedbackProduct(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        productId: number,
        @Req() req,
        @Body(new JoiValidationPipe(FeedbackProductSchema))
        body: IUserFeedbackProductDTO,
    ) {
        try {
            const userId = req.loginUser.id;
            // check whether product exists
            const productExist =
                await this.productService.checkProductExistById(productId);
            if (!productExist) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('product.productNotFound'),
                );
            }

            // check customer provide feedback before
            const customerProvidedFeedback =
                await this.productFeedbackService.checkCustomerProvidedFeedback(
                    userId,
                    productId,
                );
            if (customerProvidedFeedback) {
                return new ErrorResponse(
                    HttpStatus.ITEM_ALREADY_EXIST,
                    this.i18n.t('product.customerProvidedFeedback'),
                );
            }

            // TODO check whether customer has bought this product

            const feedbackId =
                await this.productFeedbackService.feedbackProduct(
                    productId,
                    userId,
                    body,
                );

            return new SuccessResponse({ id: feedbackId });
        } catch (error) {
            this.logger.error(`Error in feedbackProduct API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Post('/wishlist')
    async addProductToWishlist(
        @Req() req,
        @Body(new JoiValidationPipe(addProductToWWishlistSchema))
        body: IAddProductToWishlistDTO,
    ) {
        try {
            const userId = req.loginUser.id;
            // check whether product exists
            const productExist =
                await this.productService.checkProductExistById(body.productId);
            if (!productExist) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('product.productNotFound'),
                );
            }

            // check if this product is already in wishlist
            const productIsInWishlist =
                await this.productService.checkProductInWishlist(
                    userId,
                    body.productId,
                );
            if (productIsInWishlist) {
                return new ErrorResponse(
                    HttpStatus.ITEM_ALREADY_EXIST,
                    this.i18n.t('product.productAlreadyInWishlist'),
                );
            }

            const productWishlistId =
                await this.productService.addProductToWishlist(
                    userId,
                    body.productId,
                );
            return new SuccessResponse({ id: productWishlistId });
        } catch (error) {
            this.logger.error(`Error in addProductToWishlist API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Delete('/wishlist/product/:id')
    async deleteProductFromWishlist(
        @Req() req,
        @Param('id', new JoiValidationPipe(idSchema))
        productId: number,
    ) {
        try {
            const userId = req.loginUser.id;
            // check whether product exists
            const productExist =
                await this.productService.checkProductExistById(productId);
            if (!productExist) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('product.productNotFound'),
                );
            }
            await this.productService.deleteProductFromWishlist(
                userId,
                productId,
            );
            return new SuccessResponse({ id: productId });
        } catch (error) {
            this.logger.error(
                `Error in deleteProductFromWishlist API, ${error}`,
            );
            return new InternalServerErrorException(error);
        }
    }
}
