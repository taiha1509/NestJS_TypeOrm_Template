import {
    MAX_PAGE_LIMIT,
    MAX_PAGE_VALUE,
    MIN_PAGE_LIMIT,
    MIN_PAGE_VALUE,
} from '@/common/constants';
import Joi from '@/plugins/joi';

export const addProductToCartSchema = Joi.object().keys({
    productId: Joi.number().positive().required(),
    quantity: Joi.number().positive().required(),
});

export const getCartSchema = Joi.object().keys({
    page: Joi.number()
        .min(MIN_PAGE_VALUE)
        .max(MAX_PAGE_VALUE)
        .optional()
        .allow(null),
    limit: Joi.number()
        .min(MIN_PAGE_LIMIT)
        .max(MAX_PAGE_LIMIT)
        .optional()
        .allow(null),
});

export const updateProductCartSchema = Joi.object().keys({
    quantity: Joi.number().positive().required(),
});
