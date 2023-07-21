import { categoryListAttributes } from '@/modules/category/category.constant';
import { fileAttributes } from '@/modules/file/file.constant';
import { Category } from '@/mysql-entity/category.entity';
import { CustomerProductWishList } from '@/mysql-entity/customer-product-wishlist';
import { File } from '@/mysql-entity/file.entity';
import { ProductCategory } from '@/mysql-entity/product-category';
import { ProductFeedback } from '@/mysql-entity/product-feedback.entity';
import { ProductFile } from '@/mysql-entity/product-file.entity';
import { Product } from '@/mysql-entity/product.entity';
import { User } from '@/mysql-entity/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
} from 'src/common/constants';
import { createWinstonLogger } from 'src/common/services/winston.service';
import { Brackets, FindOptionsSelect, In, Repository } from 'typeorm';
import {
    MODULE_NAME,
    productCategoryAttributes,
    productDetailAttributes,
    productFeedbackAttributes,
    productFileAttributes,
    productListAttributes,
} from '../product.constant';
import {
    ICreateProductDTO,
    IProductListQuery,
    IUserFeedbackProductDTO,
} from '../product.interface';

@Injectable()
export class ProductSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(CustomerProductWishList)
        private readonly productWishlistRepository: Repository<CustomerProductWishList>,
        @InjectRepository(Product)
        private readonly categoryRepository: Repository<Product>,
        @InjectRepository(ProductFeedback)
        private readonly productFeedbackRepository: Repository<ProductFeedback>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getProductList(
        query: IProductListQuery,
        userId?: number,
        attributes = productListAttributes,
    ) {
        try {
            const {
                page = +DEFAULT_FIRST_PAGE,
                limit = +DEFAULT_LIMIT_FOR_PAGINATION,
                keyword = '',
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                categoryIds = [],
                ids = [],
            } = query;
            const qb = this.productRepository
                .createQueryBuilder('p')
                .where(
                    new Brackets((qb) => {
                        if (keyword) {
                            qb.where('p.name LIKE :keyword', {
                                keyword: `%${keyword}%`,
                            });
                        }
                        if (categoryIds.length) {
                            qb.orWhere('c.id IN (:...categoryIds)', {
                                categoryIds: categoryIds.map((id) =>
                                    Number.parseInt(id),
                                ),
                            });
                        }
                        if (ids.length) {
                            qb.orWhere('p.id IN (:...ids)', {
                                ids: ids.map((id) => Number.parseInt(id)),
                            });
                        }
                    }),
                )
                .leftJoinAndSelect(ProductCategory, 'pc', 'p.id = pc.productId')
                .leftJoinAndMapMany(
                    'p.categories',
                    Category,
                    'c',
                    'c.id = pc.categoryId',
                )
                .leftJoinAndSelect(ProductFile, 'pf', 'p.id = pf.productId')
                .leftJoinAndMapMany('p.images', File, 'f', 'f.id = pf.fileId')
                .leftJoinAndMapMany(
                    'p.customerProductWishList',
                    CustomerProductWishList,
                    'cpw',
                    'cpw.productId = p.id AND cpw.customerId = :userId',
                    {
                        userId,
                    },
                )
                .orderBy(`p.${orderBy}`, orderDirection)
                .skip((page - 1) * limit)
                .take(limit)
                .select([
                    ...attributes.map((attr) => `p.${attr}`),
                    ...categoryListAttributes.map((attr) => `c.${attr}`),
                    ...fileAttributes.map((attr) => `f.${attr}`),
                    'cpw.id',
                ]);
            const [products, count] = await qb.getManyAndCount();
            return {
                totalItems: count,
                items: products || [],
            };
        } catch (error) {
            this.logger.error('Error in getProductList service', error);
            throw error;
        }
    }

    async getProductById(id: number, attributes = productDetailAttributes) {
        try {
            const product = await this.productRepository.findOne({
                where: {
                    id,
                },
                select: attributes as FindOptionsSelect<Product>,
            });
            return product;
        } catch (error) {
            this.logger.error('Error in getProductById service', error);
            throw error;
        }
    }

    async addProductToWishlist(userId: number, productId: number) {
        try {
            const insertResult = await this.productWishlistRepository.insert({
                customerId: userId,
                productId,
                createdBy: userId,
            });

            return insertResult.identifiers?.[0]?.id;
        } catch (error) {
            this.logger.error('Error in addProductToWishlist service', error);
            throw error;
        }
    }

    async deleteProductFromWishlist(userId: number, productId: number) {
        try {
            await this.productWishlistRepository.update(
                { customerId: userId, productId },
                {
                    deletedAt: new Date(),
                    deletedBy: userId,
                },
            );
        } catch (error) {
            this.logger.error(
                'Error in deleteProductFromWishlist service',
                error,
            );
            throw error;
        }
    }

    async getProductDetail(
        id: number,
        userId?: number,
        attributes = productDetailAttributes,
    ) {
        try {
            const product = await this.productRepository
                .createQueryBuilder('p')
                .leftJoinAndMapOne(
                    'c.productCategory',
                    ProductCategory,
                    'pc',
                    'pc.productId = p.id',
                )
                .leftJoinAndMapMany(
                    'p.categories',
                    Category,
                    'c',
                    'c.id = pc.categoryId',
                )
                .leftJoinAndMapMany(
                    'p.feedbacks',
                    ProductFeedback,
                    'pf',
                    'p.id = pf.productId',
                )
                .leftJoinAndMapOne('pf.user', User, 'u', 'u.id = pf.customerId')
                .leftJoinAndMapOne(
                    'u.avatar',
                    File,
                    'avatar',
                    'u.avatarId = avatar.id',
                )
                .leftJoinAndMapOne(
                    'f.productFile',
                    ProductFile,
                    'pfile',
                    'p.id = pfile.productId',
                )
                .leftJoinAndMapMany(
                    'p.images',
                    File,
                    'f',
                    'f.id = pfile.fileId',
                )
                .leftJoinAndMapMany(
                    'p.customerProductWishList',
                    CustomerProductWishList,
                    'cpw',
                    'cpw.productId = p.id AND cpw.customerId = :userId',
                    {
                        userId,
                    },
                )
                .where('p.id = :productId', { productId: id })
                .select([
                    ...attributes.map((a) => `p.${a}`),
                    ...categoryListAttributes.map((a) => `c.${a}`),
                    ...productFeedbackAttributes.map((a) => `pf.${a}`),
                    ...fileAttributes.map((attr) => `f.${attr}`),
                    ...productFileAttributes.map((attr) => `pfile.${attr}`),
                    ...productCategoryAttributes.map((attr) => `pc.${attr}`),
                    'cpw.id',
                    ...['u.id', 'u.name'],
                    ...fileAttributes.map((attr) => `avatar.${attr}`),
                ])
                .getOne();

            return product;
        } catch (error) {
            this.logger.error('Error in getProductDetail service', error);
            throw error;
        }
    }

    async checkProductExistById(id: number) {
        try {
            return await this.productRepository.exist({ where: { id } });
        } catch (error) {
            this.logger.error('Error in checkProductExistById service', error);
            throw error;
        }
    }

    async checkProductInWishlist(userId: number, productId: number) {
        try {
            return await this.productWishlistRepository.exist({
                where: { productId, customerId: userId },
            });
        } catch (error) {
            this.logger.error('Error in checkProductInWishlist service', error);
            throw error;
        }
    }
}
