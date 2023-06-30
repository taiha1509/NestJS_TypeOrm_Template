import { ICommonListQuery } from '@/common/interfaces';
import { CategoryOrderBy } from './category.constant';

export interface ICategoryListQuery extends ICommonListQuery {
    orderBy: CategoryOrderBy;
    ids: string[];
}
