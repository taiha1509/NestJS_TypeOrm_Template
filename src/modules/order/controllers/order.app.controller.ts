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
import { ErrorResponse, SuccessResponse } from 'src/common/helpers/response';
import { JoiValidationPipe } from 'src/common/pipe/joi.validation.pipe';

import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { createWinstonLogger } from '@/common/services/winston.service';
import {
    MODULE_NAME,
    ORDER_ITEM_MAX_LENGTH,
    PaymentMethod,
} from '../order.constant';
import {
    ICreateCustomerOrderDTO,
    ICreditDebitPaymentDetail,
    IGetOrderListQuery,
} from '../order.interface';
import {
    CreateCustomerOrderSchema,
    GetOrderListSchema,
} from '../order.validator';
import { OrderSqlService } from '../services/order.sql.service';

@Controller('/app/order')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CustomerOrderAppController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly orderService: OrderSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get('/')
    async getOrderList(
        @Query(new JoiValidationPipe(GetOrderListSchema))
        query: IGetOrderListQuery,
        @Req() req,
    ) {
        try {
            const loginUser = req.loginUser;
            const orderList = await this.orderService.getOrderList(
                query,
                loginUser.id,
            );
            return new SuccessResponse(orderList);
        } catch (error) {
            this.logger.error(`Error in getOrderList API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Get('/:id')
    async getOrderDetail(
        @Param('id', new ParseIntPipe())
        orderId: number,
        @Req() req,
    ) {
        try {
            const loginUser = req.loginUser;
            const orderDetail = await this.orderService.getOrderDetail(
                loginUser.id,
                orderId,
            );

            if (!orderDetail) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    this.i18n.t('errors.404'),
                );
            }
            return new SuccessResponse(orderDetail);
        } catch (error) {
            this.logger.error(`Error in getOrderDetail API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/')
    async createOrder(
        @Body(new JoiValidationPipe(CreateCustomerOrderSchema))
        body: ICreateCustomerOrderDTO,
        @Req() req,
    ) {
        try {
            const loginUser = req.loginUser;
            const productIdToQuantityMapping = new Map<number, number>();
            const productIdToQuantityInCartMapping = new Map<number, number>();

            const productListInCart =
                await this.orderService.getProductListInCartByUserId(
                    loginUser.id,
                );
            // cart is empty
            if (!productListInCart?.length) {
                return new ErrorResponse(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    this.i18n.t('order.cartEmpty'),
                );
            }
            const cartId = productListInCart[0].cartItem?.cartId;
            productListInCart.forEach((p) => {
                productIdToQuantityMapping.set(p.id, p.quantity);
                productIdToQuantityInCartMapping.set(
                    p.cartItem.productId,
                    p.cartItem.quantity,
                );
            });
            const isProductQuantityNotEnough = productListInCart.some(
                (p) =>
                    p.cartItem?.quantity > productIdToQuantityMapping.get(p.id),
            );

            if (isProductQuantityNotEnough) {
                return new ErrorResponse(
                    HttpStatus.QUANTITY_NOT_ENOUGH,
                    this.i18n.t('order.quantityNotEnough'),
                );
            }

            // check card expiration date
            if (body.paymentMethod === PaymentMethod.CREDIT_OR_DEBIT) {
                const paymentDetail =
                    body.paymentDetail as ICreditDebitPaymentDetail;
                const expirationDateArr =
                    paymentDetail.expirationDate.split('/');
                const dateNow = new Date();
                const cardExpired =
                    dateNow.getFullYear() % 100 > +expirationDateArr[1] ||
                    (dateNow.getFullYear() == +expirationDateArr[1] &&
                        dateNow.getMonth() + 1 >= +expirationDateArr[0]);
                if (cardExpired) {
                    return new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        this.i18n.t('errors.400'),
                        [
                            {
                                key: 'paymentDetail.expirationDate',
                                errorCode: HttpStatus.NOT_SUPPORTED,
                                message: this.i18n.t('order.cardExpired'),
                            },
                        ],
                    );
                }
            }

            // TODO calc shipping fee
            const shippingFee = 1000;
            const orderId = await this.orderService.createOrder(
                body,
                shippingFee,
                productIdToQuantityInCartMapping,
                req?.loginUser?.id,
                cartId,
                productListInCart,
            );

            return new SuccessResponse({ id: orderId });
        } catch (error) {
            this.logger.error(`Error in createOrder API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
