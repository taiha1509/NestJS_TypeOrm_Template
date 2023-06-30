import Joi from 'src/plugins/joi';
import { CommonListQuerySchema } from 'src/common/constants';
import { ProductOrderBy } from './product.constant';

export const productListQuerySchema = Joi.object().keys({
    ...CommonListQuerySchema,
    orderBy: Joi.string()
        .valid(...Object.values(ProductOrderBy))
        .optional(),
    categoryIds: Joi.array().items(Joi.number().positive()).unique().optional(),
    ids: Joi.array().items(Joi.number().positive()).unique().optional(),
});

export const ProductWishListQuerySchema = Joi.object().keys({
    ...CommonListQuerySchema,
});
