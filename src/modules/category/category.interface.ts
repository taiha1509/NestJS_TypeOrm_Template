import { ICommonListQuery } from '@/common/interfaces';
import { CategoryOrderBy } from './category.constant';

export interface ICategoryListQuery extends ICommonListQuery {
    orderBy: CategoryOrderBy;
    ids: string[];
}

export interface ICreateCategoryDTO {
    name: string;
    description?: string;
    createdBy?: number;
}

export interface IUpdateCategoryDTO extends ICreateCategoryDTO {
    updatedBy?: number;
}
