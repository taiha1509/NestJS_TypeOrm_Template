import Joi from 'src/plugins/joi';
import {
    CommonListQuerySchema,
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from 'src/common/constants';
import { CategoryOrderBy } from './category.constant';

export const categoryListQuerySchema = Joi.object().keys({
    ...CommonListQuerySchema,
    orderBy: Joi.string()
        .valid(...Object.values(CategoryOrderBy))
        .optional(),
    ids: Joi.array().items(Joi.number().positive()).unique().optional(),
});

export const updateCategorySchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    description: Joi.string()
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .allow('', null),
});

export const createCategorySchema = updateCategorySchema.keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});
