import { INPUT_TEXT_MAX_LENGTH, TEXTAREA_MAX_LENGTH } from '@/common/constants';
import Joi from '@/plugins/joi';

export const registerFileSchema = Joi.object().keys({
    originalName: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    key: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    mimeType: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    size: Joi.number().positive().required(),
});

export const getPresignedPutURLQuerySchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});
