import Joi from '@/plugins/joi';

export const idSchema = Joi.number().positive().required();
