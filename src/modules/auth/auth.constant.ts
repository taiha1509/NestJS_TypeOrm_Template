export const MODULE_NAME = 'auth';

export const GoogleLoginLinkParameters = {
    scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ],
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent',
    prefixUrl: 'https://accounts.google.com/o/oauth2/v2/auth?',
};
export const GoogleUserInfoUrl =
    'https://www.googleapis.com/oauth2/v1/userinfo';
export const GoogleGetAccessTokenUrl = 'https://oauth2.googleapis.com/token';

export enum AuthProvider {
    EMAIL = 'email',
    GOOGLE = 'google',
}

export enum UserTokenType {
    REFRESH_TOKEN = 'refresh_token',
}

export enum UserOTPType {
    RESET_PASSWORD = 'reset_password',
    REGISTER_USER = 'register_user',
}

export const OTP_LENGTH = 6;
