import { ICommonListQuery } from 'src/common/interfaces';
import { SystemRole, UserGender, UserOrderBy } from './user.constant';

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
