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
import { idSchema } from '@/modules/common/common.validator';
import { createWinstonLogger } from '@/common/services/winston.service';
import { ICommonListQuery } from '@/common/interfaces';
import { MODULE_NAME } from './cart.constant';
import {
    addProductToCartSchema,
    getCartSchema,
    updateProductCartSchema,
} from './cart.validator';
import { IAddProductToCartDTO } from './cart.interface';
import { ProductSqlService } from '../product/services/product.sql.service';
import { HttpStatus } from '@/common/constants';
import { CartSqlService } from './services/cart.sql.service';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('/app/cart')
export class CartAppController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly productSqlService: ProductSqlService,
        private readonly cartSqlService: CartSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get('/')
    async getCartInfo(
        @Req() req,
        @Query(new JoiValidationPipe(getCartSchema)) query,
    ) {
        try {
            const customerId = req.loginUser?.id;
            const cartInfo = await this.cartSqlService.getCustomerCart(
                customerId,
                query,
            );
            return new SuccessResponse(cartInfo);
        } catch (error) {
            this.logger.error(`Error in getCartInfo API, ${error}`);
            return new InternalServerErrorException();
        }
    }

    @Post('/product')
    async addProductToCart(
        @Req() req,
        @Body(new JoiValidationPipe(addProductToCartSchema))
        body: IAddProductToCartDTO,
    ) {
        try {
            const customerId = req.loginUser?.id;
            // check product exists
            const product = await this.productSqlService.getProductById(
                body.productId,
                ['id', 'quantity'],
            );
            if (!product) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('product.productNotFound'),
                );
            }
            // check if product already exists in cart
            const productInCart = await this.cartSqlService.getProductInCart(
                body.productId,
                customerId,
            );
            // check available product quantity
            if (
                (body.quantity + productInCart?.quantity || 0) >
                product.quantity
            ) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            errorCode: HttpStatus.GROUP_MAX_QUANTITY,
                            key: 'quantity',
                            message: this.i18n.t('product.quantityExceed'),
                        },
                    ],
                );
            }
            body.quantity += productInCart?.quantity || 0;
            const result = await this.cartSqlService.addProductToCart(
                customerId,
                body.productId,
                body.quantity,
                !!productInCart,
            );
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`Error in addProductToCart API, ${error}`);
            return new InternalServerErrorException();
        }
    }

    @Patch('/product/:id')
    async updateProductInCart(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        productId: number,
        @Req() req,
        @Body(new JoiValidationPipe(updateProductCartSchema))
        body: { quantity: number },
    ) {
        try {
            const productExistInCart =
                await this.cartSqlService.checkProductExistInCart(
                    productId,
                    req.loginUser.id,
                );
            if (!productExistInCart) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('product.productNotFound'),
                );
            }

            // check product exists
            const product = await this.productSqlService.getProductById(
                productId,
                ['id', 'quantity'],
            );
            if (!product) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('product.productNotFound'),
                );
            }
            // check available product quantity
            if (body.quantity > product.quantity) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            errorCode: HttpStatus.GROUP_MAX_QUANTITY,
                            key: 'quantity',
                            message: this.i18n.t('product.quantityExceed'),
                        },
                    ],
                );
            }

            await this.cartSqlService.updateProductInCart(
                productId,
                req.loginUser.id,
                body.quantity,
            );

            return new SuccessResponse({ id: productId });
        } catch (error) {
            this.logger.error(`Error in updateProduct API, ${error}`);
            return new InternalServerErrorException();
        }
    }

    @Delete('/product/:id')
    async removeProductFromCart(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        productId: number,
        @Req() req,
    ) {
        try {
            const productExistInCart =
                await this.cartSqlService.checkProductExistInCart(
                    productId,
                    req.loginUser.id,
                );
            if (!productExistInCart) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('product.productNotFound'),
                );
            }

            await this.cartSqlService.removeProductFromCart(
                productId,
                req.loginUser.id,
            );

            return new SuccessResponse({ id: productId });
        } catch (error) {
            this.logger.error(`Error in removeProductFromCart API, ${error}`);
            return new InternalServerErrorException();
        }
    }
}
