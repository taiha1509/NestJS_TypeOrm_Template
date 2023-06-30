import Joi from 'src/plugins/joi';
import { CommonListQuerySchema } from 'src/common/constants';
import { CategoryOrderBy } from './category.constant';

export const categoryListQuerySchema = Joi.object().keys({
    ...CommonListQuerySchema,
    orderBy: Joi.string()
        .valid(...Object.values(CategoryOrderBy))
        .optional(),
    ids: Joi.array().items(Joi.number().positive()).unique().optional(),
});
