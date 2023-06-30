export enum PaymentMethod {
    // cash on delivery
    COD = 'cod',
    LOCAL_BANKING = 'local_banking',
    CREDIT_OR_DEBIT = 'credit_or_debit',
}

export enum CustomerOrderStatus {
    WAITING_FOR_CONFIRMATION = 'waiting_for_confirmation',
    PROCESSING = 'processing',
    DELIVERING = 'delivering',
    COMPLETED = 'completed',
    CANCELED = 'canceled',
}

export const MODULE_NAME = 'customer-order';
export const CVC_LENGTH = 3;
export const CARD_NUMBER_LENGTH = 16;

export const BankRule = {
    accountNumber: {
        min: 9,
        max: 14,
    },
    accountName: {
        min: 9,
        max: 15,
    },
};

export const ORDER_ITEM_MAX_LENGTH = 10000;

export const orderListAttributes = [
    'id',
    'phoneNumber',
    'customerName',
    'address',
    'province',
    'district',
    'ward',
    'note',
    'customerId',
    'paymentMethod',
    'shippingFee',
    'status',
    'items',
    'createdAt',
];

export const orderDetailAttributes = [...orderListAttributes, 'code'];
