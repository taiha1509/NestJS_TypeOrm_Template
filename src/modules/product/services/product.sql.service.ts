import { categoryListAttributes } from '@/modules/category/category.constant';
import { Category } from '@/mysql-entity/category.entity';
import { ProductCategory } from '@/mysql-entity/product-category';
import { Product } from '@/mysql-entity/product.entity';
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
import { Brackets, FindOptionsSelect, Repository } from 'typeorm';
import {
    MODULE_NAME,
    productDetailAttributes,
    productListAttributes,
} from '../product.constant';
import { IProductListQuery } from '../product.interface';

@Injectable()
export class ProductSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getProductList(
        query: IProductListQuery,
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
                .orderBy(`p.${orderBy}`, orderDirection)
                .skip((page - 1) * limit)
                .take(limit)
                .select([
                    ...attributes.map((attr) => `p.${attr}`),
                    ...categoryListAttributes.map((attr) => `c.${attr}`),
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
}
