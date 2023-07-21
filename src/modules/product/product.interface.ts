import { ICommonListQuery } from '@/common/interfaces';
import {
    ProductColor,
    ProductImageType,
    ProductSize,
    ProductStatus,
} from './product.constant';

export interface IProductListQuery extends ICommonListQuery {
    categoryIds: string[];
    ids: string[] | number[];
}

export interface IUserFeedbackProductDTO {
    comment?: string;
    rating?: number;
}

export interface IUpdateProductDTO {
    name: string;
    images: {
        order: number;
        imageId: number;
        type: ProductImageType;
    }[];
    quantity: number;
    price: number;
    status: ProductStatus;
    description: string;
    material?: string;
    usageInstruction?: string;
    categoryIds: number[];
    updatedBy?: number;
}

export interface ICreateProductDTO extends IUpdateProductDTO {
    size: ProductSize[];
    color: ProductColor[];
    createdBy?: number;
}

export interface IAddProductToWishlistDTO {
    productId: number;
}
