import Joi from '@/plugins/joi';
import { ObjectSchema } from 'joi';

export const idSchema = Joi.number().positive().required();
