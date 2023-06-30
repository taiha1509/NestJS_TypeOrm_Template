import { ICommonListQuery } from '@/common/interfaces';

export interface IProductListQuery extends ICommonListQuery {
    categoryIds: string[];
    ids: string[] | number[];
}
