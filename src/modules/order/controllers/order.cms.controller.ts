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
    IGetAdminOrderListQuery,
    IUpdateAdminOrderDTO,
    ICreateCustomerOrderDTO,
    ICreditDebitPaymentDetail,
    IGetOrderListQuery,
} from '../order.interface';
import {
    getAdminOrderListSchema,
    updateAdminOrderSchema,
    CreateCustomerOrderSchema,
    GetOrderListSchema,
} from '../order.validator';
import { OrderSqlService } from '../services/order.sql.service';
import { Roles } from '@/common/helpers/commonFunctions';
import { UserRole } from '@/modules/user/user.constant';
import { OrderCmsSqlService } from '../services/order.cms.service';

@Controller('/cms/order')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class CustomerOrderCmsController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly orderCmsService: OrderCmsSqlService,
        private readonly orderService: OrderSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Get('/')
    async getOrderListForAdmin(
        @Query(new JoiValidationPipe(getAdminOrderListSchema))
        query: IGetAdminOrderListQuery,
        @Req() req,
    ) {
        try {
            const orderList = await this.orderCmsService.getOrderList(query);
            return new SuccessResponse(orderList);
        } catch (error) {
            this.logger.error(`Error in getOrderListForAdmin API, ${error}`);
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
            const orderDetail = await this.orderCmsService.getOrderDetail(
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

    @Patch('/:id')
    async updateOrder(
        @Param('id', new ParseIntPipe())
        orderId: number,
        @Body(new JoiValidationPipe(updateAdminOrderSchema))
        body: IUpdateAdminOrderDTO,
        @Req() req,
    ) {
        try {
            const orderExist = await this.orderCmsService.checkOrderExistById(
                orderId,
            );

            if (!orderExist) {
                return new ErrorResponse(
                    HttpStatus.NOT_FOUND,
                    this.i18n.t('errors.404'),
                );
            }

            const orderDetail = await this.orderCmsService.updateOrder(
                orderId,
                body,
            );
            return new SuccessResponse(orderDetail);
        } catch (error) {
            this.logger.error(`Error in updateOrder API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
