import { AuthProvider, UserOTPType, UserTokenType } from './auth.constant';
import { SystemRole, UserGender } from '../user/user.constant';

export interface ILoginBody {
    provider: AuthProvider;
    email?: string;
    password?: string;
    token?: string;
    redirectUri?: string;
}

export interface IUpdateUserProfileBody {
    name: string;
}

export interface IGoogleLoginLinkQuery {
    redirectUri: string;
}

export interface IGoogleData {
    id: string;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
    picture: string;
}

export interface ICreateUserTokenBody {
    userId: number;
    hashToken: string;
    token: string;
    type: UserTokenType;
    createdBy?: number;
    deletedAt?: Date;
}

export interface ILoginUser {
    id: string;
    email: string;
    name: string;
    systemRole: SystemRole;
}

export interface IUpdatePasswordDTO {
    password: string;
    newPassword: string;
    repeatPassword: string;
}

export interface IRegisterUserDTO {
    name: string;
    email: string;
    address?: string;
    password: string;
    repeatPassword: string;
    phoneNumber: string;
    gender?: UserGender;
}

export interface IForgotPasswordDTO {
    email: string;
}

export interface IVerifyForgotPasswordOTP extends IForgotPasswordDTO {
    otp: string;
}

export interface IResetPassword {
    password: string;
    otp: string;
    email: string;
}

export type IActivateUserDTO = IVerifyForgotPasswordOTP;

export interface IResendOTPDTO {
    email: string;
    type: UserOTPType;
}

export interface IUpdatePasswordDTO {
    password: string;
    newPassword: string;
    repeatPassword: string;
}
