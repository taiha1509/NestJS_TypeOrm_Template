export const MODULE_NAME = 'user';

export const userProfileAttributes = [
    'id',
    'name',
    'email',
    'birthday',
    'address',
    'gender',
    'phoneNumber',
    'description',
    'createdAt',
    'status',
    'avatarId',
];

export enum UserOrderBy {
    EMAIL = 'email',
    NAME = 'name',
    CREATED_AT = 'createdAt',
}

export enum SystemRole {
    ADMIN = 'admin',
    DEVELOPER = 'developer',
}

export enum UserField {
    ID = 'id',
    NAME = 'name',
    EMAIL = 'email',
    SYSTEM_ROLE = 'systemRole',
}

export enum UserGender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum UserStatus {
    ACTIVE = 'active',
    REGISTERING = 'registering',
}

export const userListAttributes = [
    'id',
    'name',
    'email',
    'birthday',
    'address',
    'gender',
    'phoneNumber',
    'description',
    'avatarId',
    'createdAt',
    'createdBy',
];
