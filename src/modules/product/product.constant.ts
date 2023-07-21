export enum ProductStatus {
    SELLING = 'SELLING',
    STOP_SELLING = 'STOP_SELLING',
}

export const MODULE_NAME = 'product';

export enum ProductOrderBy {
    ID = 'id',
    NAME = 'name',
    CREATED_AT = 'createdAt',
}

export const productListAttributes = [
    'id',
    'name',
    'price',
    'quantity',
    'status',
    'size',
    'color',
    'description',
    'material',
    'usageInstruction',
    'createdAt',
];

export const productDetailAttributes = [...productListAttributes];

export const productFileAttributes = [
    'id',
    'order',
    'type',
    'productId',
    'fileId',
    'createdAt',
];

export const productCategoryAttributes = [
    'id',
    'productId',
    'categoryId',
    'priorityOrder',
    'createdAt',
];

export enum ProductSize {
    S = 's',
    M = 'm',
    L = 'l',
    XL = 'xl',
    XXL = 'xxl',
    XXXL = 'xxxl',
}

export enum ProductColor {
    BLACK = 'black',
    WHITE = 'white',
    GRAY = 'gray',
    PINK = 'pink',
    RED = 'red',
    BLUE = 'blue',
    GREEN = 'green',
    YELLOW = 'yellow',
    ORANGE = 'orange',
    PURPLE = 'purple',
}

export const productFeedbackAttributes = [
    'id',
    'comment',
    'productId',
    'customerId',
    'rating',
    'createdAt',
];

export enum ProductImageType {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    THUMBNAIL = 'thumbnail',
}
