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
    'imageUrl',
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
