import {
    INPUT_TEXT_MAX_LENGTH,
    Regex,
    DateFormat,
    PHONE_NUMBER_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from './../../common/constants';
import Joi from 'src/plugins/joi';
import { CommonListQuerySchema } from 'src/common/constants';
import { UserOrderBy, SystemRole, UserGender } from './user.constant';

export const userListQuerySchema = Joi.object().keys({
    ...CommonListQuerySchema,
    orderBy: Joi.string()
        .valid(...Object.values(UserOrderBy))
        .optional(),
});

export const createUserSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
    systemRole: Joi.string()
        .valid(...Object.values(SystemRole))
        .required(),
});

export const updateUserSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
    systemRole: Joi.string()
        .valid(...Object.values(SystemRole))
        .required(),
});

export const updateUserProfileSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    fileId: Joi.number().positive().optional().allow(null),
    birthday: Joi.date()
        .format(DateFormat.YYYY_MM_DD_HYPHEN)
        .optional()
        .allow(null),
    address: Joi.string().max(INPUT_TEXT_MAX_LENGTH).allow(null).optional(),
    gender: Joi.string()
        .valid(...Object.values(UserGender))
        .optional()
        .allow(null),
    phoneNumber: Joi.string().regex(Regex.PHONE_NUMBER).optional().allow(null),
    description: Joi.string().max(TEXTAREA_MAX_LENGTH).allow(null).optional(),
});
