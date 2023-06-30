import * as Joi from 'joi';
import ConfigKey from './config-key';

export default Joi.object({
    [ConfigKey.PORT]: Joi.number().default(3000),
    [ConfigKey.VERSION]: Joi.string().required(),
    [ConfigKey.BASE_PATH]: Joi.string().required(),
    [ConfigKey.CORS_WHITELIST]: Joi.string().required(),
    [ConfigKey.LOG_LEVEL]: Joi.string()
        .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
        .required(),
    [ConfigKey.JWT_ACCESS_TOKEN_SECRET_KEY]: Joi.string().required(),
    [ConfigKey.JWT_ACCESS_TOKEN_EXPIRED_IN]: Joi.number().required(),
    [ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY]: Joi.string().required(),
    [ConfigKey.JWT_REFRESH_TOKEN_EXPIRED_IN]: Joi.number().required(),
    [ConfigKey.GOOGLE_CLIENT_ID]: Joi.string().required(),
    [ConfigKey.MYSQL_HOST]: Joi.string().required(),
    [ConfigKey.MYSQL_PORT]: Joi.string().required(),
    [ConfigKey.MYSQL_USER]: Joi.string().required(),
    [ConfigKey.MYSQL_PASSWORD]: Joi.string().required(),
    [ConfigKey.MYSQL_DATABASE_NAME]: Joi.string().required(),
    [ConfigKey.MYSQL_CONNECTION_LIMIT]: Joi.string().required(),
    [ConfigKey.MYSQL_CONNECTION_RATE_LIMIT]: Joi.string().required(),
    [ConfigKey.MYSQL_DEBUG_MODE]: Joi.number().required(),
    [ConfigKey.SENDGRID_API_KEY]: Joi.string().required(),
    [ConfigKey.SENDGRID_API_HOST]: Joi.string().required(),
    [ConfigKey.SENDGRID_SENDER_EMAIL]: Joi.string().required(),
    [ConfigKey.RESET_PASSWORD_OTP_EXPIRED_IN]: Joi.string().required(),
    [ConfigKey.REGISTER_USER_OTP_EXPIRED_IN]: Joi.string().required(),
});
