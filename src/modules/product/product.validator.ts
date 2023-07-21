import Joi from 'src/plugins/joi';
import {
    CommonListQuerySchema,
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';
import {
    ProductColor,
    ProductImageType,
    ProductOrderBy,
    ProductSize,
    ProductStatus,
} from './product.constant';

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

export const productRatingRule = {
    min: 1,
    max: 5,
};

export const FeedbackProductSchema = Joi.object()
    .keys({
        comment: Joi.string().max(TEXTAREA_MAX_LENGTH).optional().allow(null),
        rating: Joi.number()
            .min(productRatingRule.min)
            .max(productRatingRule.max)
            .optional()
            .allow(null),
    })
    .or('comment', 'rating');

export const updateProductBodySchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    images: Joi.array()
        .optional()
        .allow(null)
        .items(
            Joi.object().keys({
                order: Joi.number().required(),
                imageId: Joi.number().positive().required(),
                type: Joi.string()
                    .valid(...Object.values(ProductImageType))
                    .required(),
            }),
        ),
    quantity: Joi.number().positive().required(),
    price: Joi.number().positive().required(),
    status: Joi.string()
        .valid(...Object.values(ProductStatus))
        .required(),
    description: Joi.string().max(TEXTAREA_MAX_LENGTH).required(),
    material: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(''),
    usageInstruction: Joi.string()
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .allow(''),
    categoryIds: Joi.array()
        .items(Joi.number().positive().optional())
        .unique()
        .required(),
});
export const createProductBodySchema = updateProductBodySchema.keys({
    size: Joi.array()
        .items(
            Joi.string()
                .valid(...Object.values(ProductSize))
                .required(),
        )
        .unique()
        .required(),
    color: Joi.array()
        .items(
            Joi.string()
                .valid(...Object.values(ProductColor))
                .required(),
        )
        .unique()
        .required(),
});

export const addProductToWWishlistSchema = Joi.object().keys({
    productId: Joi.number().positive().required(),
});
