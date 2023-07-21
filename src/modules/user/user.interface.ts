import { ICommonListQuery } from '@/common/interfaces';
import {
    SystemRole,
    UserGender,
    UserOrderBy,
    UserRole,
    UserStatus,
} from './user.constant';

export interface IUserCreateBody {
    email: string;
    password?: string;
    name?: string;
    systemRole: SystemRole;
}

export interface IUser extends IUserCreateBody {
    id: number;
}

export interface IUserUpdateBody extends IUpdateUserProfileDTO {
    updatedBy?: number;
}

export interface IUserListQuery extends ICommonListQuery {
    orderBy: UserOrderBy;
    roles?: UserRole[];
    statuses?: UserStatus[];
}

export interface IUpdateUserProfileDTO {
    avatarId?: number | null;
    name?: string | null;
    address?: string | null;
    birthday?: Date | string | null;
    description?: string | null;
    phoneNumber?: string | null;
    gender?: UserGender | null;
}

export interface IUpdateCustomerDTO {
    name?: string;
    phoneNumber?: string;
    gender?: UserGender;
    address?: string;
    status?: UserStatus;
    description?: string;
    updatedBy?: number;
}

export interface ICreateAdminUserDTO extends IUpdateAdminUserDTO {
    email: string;
    createdBy?: number;
}

export interface IUpdateAdminUserDTO {
    name: string;
    avatarId?: number;
    phoneNumber: string;
    role: UserRole.ADMIN | UserRole.SUPER_ADMIN;
    status: UserStatus;
    updatedBy?: number;
}
