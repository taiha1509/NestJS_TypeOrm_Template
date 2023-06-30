import {
    CommonListQuerySchema,
    DateFormat,
    INPUT_TEXT_MAX_LENGTH,
    Regex,
    TEXTAREA_MAX_LENGTH,
} from '@/common/constants';
import Joi from '@/plugins/joi';
import {
    BankRule,
    CARD_NUMBER_LENGTH,
    CustomerOrderStatus,
    CVC_LENGTH,
    ORDER_ITEM_MAX_LENGTH,
    PaymentMethod,
} from './order.constant';

export const CreateCustomerOrderSchema = Joi.object().keys({
    phoneNumber: Joi.string().regex(Regex.PHONE_NUMBER).required(),
    code: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    customerName: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    address: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    province: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    district: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    ward: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    note: Joi.string().max(TEXTAREA_MAX_LENGTH).required(),
    paymentMethod: Joi.string()
        .valid(...Object.values(PaymentMethod))
        .required(),
    paymentDetail: Joi.when('paymentMethod', {
        switch: [
            {
                is: PaymentMethod.COD,
                then: Joi.forbidden(),
            },
            {
                is: PaymentMethod.CREDIT_OR_DEBIT,
                then: Joi.object().keys({
                    cardNumber: Joi.string()
                        .length(CARD_NUMBER_LENGTH)
                        .required(),
                    cardHolderName: Joi.string()
                        .max(INPUT_TEXT_MAX_LENGTH)
                        .required(),
                    expirationDate: Joi.string()
                        .regex(Regex.creditCard.EXPIRATION_DATE)
                        .required(),
                    cvc: Joi.string().length(CVC_LENGTH).required(),
                }),
            },
            {
                is: PaymentMethod.LOCAL_BANKING,
                then: Joi.object().keys({
                    bankName: Joi.string()
                        .max(INPUT_TEXT_MAX_LENGTH)
                        .required(),
                    accountNumber: Joi.string()
                        .max(BankRule.accountNumber.max)
                        .min(BankRule.accountNumber.min)
                        .required(),
                    accountHolderName: Joi.string()
                        .max(BankRule.accountName.max)
                        .min(BankRule.accountName.min)
                        .required(),
                }),
            },
        ],
        otherwise: Joi.forbidden(),
    }),
});

export const GetOrderListSchema = Joi.object().keys({
    ...CommonListQuerySchema,
    status: Joi.string()
        .valid(...Object.values(CustomerOrderStatus))
        .optional(),
});
