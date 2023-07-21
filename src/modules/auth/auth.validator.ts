import {
    DateFormat,
    INPUT_TEXT_MAX_LENGTH,
    PHONE_NUMBER_MAX_LENGTH,
    Regex,
    TEXTAREA_MAX_LENGTH,
} from '@/common/constants';

import Joi from '@/plugins/joi';
import { UserGender } from '../user/user.constant';
import { AuthProvider, OTP_LENGTH, UserOTPType } from './auth.constant';

export const getGoogleLoginUrlQuerySchema = Joi.object().keys({
    redirectUri: Joi.string().max(TEXTAREA_MAX_LENGTH).uri().required(),
});

export const loginBodySchema = Joi.object().keys({
    provider: Joi.string()
        .valid(...Object.values(AuthProvider))
        .required(),
    email: Joi.when('provider', {
        is: AuthProvider.EMAIL,
        then: Joi.string()
            .regex(Regex.EMAIL)
            .max(INPUT_TEXT_MAX_LENGTH)
            .required(),
        otherwise: Joi.forbidden(),
    }),
    password: Joi.when('provider', {
        is: AuthProvider.EMAIL,
        then: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
        otherwise: Joi.forbidden(),
    }),

    token: Joi.when('provider', {
        is: Joi.valid(AuthProvider.GOOGLE),
        then: Joi.string().required(),
        otherwise: Joi.forbidden(),
    }),
    redirectUri: Joi.when('provider', {
        switch: [
            {
                is: Joi.exist().valid(AuthProvider.GOOGLE),
                then: Joi.string().max(TEXTAREA_MAX_LENGTH).uri().required(),
            },
        ],
        otherwise: Joi.forbidden(),
    }),
});

export const updateUserProfileSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    avatarId: Joi.number().positive().optional().allow(null),
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

export const updatePasswordSchema = Joi.object().keys({
    password: Joi.string().regex(Regex.PASSWORD).required(),
    newPassword: Joi.string()
        .regex(Regex.PASSWORD)
        .invalid(Joi.ref('password'))
        .required(),
    repeatPassword: Joi.string()
        .regex(Regex.PASSWORD)
        .valid(Joi.ref('newPassword'))
        .required(),
});

export const forgotPasswordSchema = Joi.object().keys({
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
});

export const registerUserSchema = Joi.object().keys({
    name: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
    address: Joi.string().max(INPUT_TEXT_MAX_LENGTH).allow(null).optional(),
    gender: Joi.string()
        .valid(...Object.values(UserGender))
        .optional()
        .allow(null),
    phoneNumber: Joi.string().max(PHONE_NUMBER_MAX_LENGTH).required(),
    password: Joi.string().regex(Regex.PASSWORD).required(),
    repeatPassword: Joi.string()
        .regex(Regex.PASSWORD)
        .valid(Joi.ref('password'))
        .required(),
});

export const resetPasswordSchema = Joi.object().keys({
    password: Joi.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    otp: Joi.string().length(OTP_LENGTH).required(),
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
});

export const verifyForgotPasswordOTPSchema = Joi.object().keys({
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
    otp: Joi.string().length(OTP_LENGTH).required(),
});

export const activateUserSchema = verifyForgotPasswordOTPSchema;

export const resendOTPSchema = Joi.object().keys({
    email: Joi.string()
        .regex(Regex.EMAIL)
        .max(INPUT_TEXT_MAX_LENGTH)
        .required(),
    type: Joi.string()
        .valid(...Object.values(UserOTPType))
        .required(),
});
