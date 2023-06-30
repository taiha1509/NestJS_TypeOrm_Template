import { OrderDirection } from './constants';

export interface IUserToken {
    id: string;
    email: string;
    fullName: string;
}
export interface ICommonListQuery {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: OrderDirection;
    keyword?: string;
}

export interface IPaginationResult<T> {
    items: T[];
    totalItems: number;
}
