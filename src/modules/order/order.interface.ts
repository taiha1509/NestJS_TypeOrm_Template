import { ICommonListQuery } from '@/common/interfaces';
import { CustomerOrderStatus, PaymentMethod } from './order.constant';

export interface IBankingPaymentDetail {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
}

export interface ICreditDebitPaymentDetail {
    cardNumber: string;
    cardHolderName: string;
    expirationDate: string;
    cvc: string;
}

export interface ICreateCustomerOrderDTO {
    code: string;
    phoneNumber: string;
    customerName: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    note: string;
    paymentMethod: PaymentMethod;
    paymentDetail: IBankingPaymentDetail | ICreditDebitPaymentDetail | null;
}

export interface IGetOrderListQuery extends ICommonListQuery {
    statuses?: CustomerOrderStatus[];
}

export interface IGetAdminOrderListQuery extends IGetOrderListQuery {
    isPaid?: string;
}

export interface IUpdateAdminOrderDTO {
    isPaid?: boolean;
    status?: CustomerOrderStatus;
}
