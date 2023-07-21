import {
    categoryListAttributes,
    MODULE_NAME,
} from '@/modules/category/category.constant';
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
} from '@/common/constants';
import { createWinstonLogger } from '@/common/services/winston.service';
import { Brackets, FindOptionsSelect, Repository } from 'typeorm';
import { ICategoryListQuery } from '../category.interface';

@Injectable()
export class CategorySqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getCategoryList(
        query: ICategoryListQuery,
        attributes = categoryListAttributes,
    ) {
        try {
            const {
                page = +DEFAULT_FIRST_PAGE,
                limit = +DEFAULT_LIMIT_FOR_PAGINATION,
                keyword = '',
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                ids = [],
            } = query;
            const [categories, count] = await this.categoryRepository
                .createQueryBuilder('c')
                .where(
                    new Brackets((qb) => {
                        if (keyword) {
                            qb.where('name LIKE :keyword', {
                                keyword: `%${keyword}%`,
                            });
                        }
                        if (ids.length) {
                            qb.orWhere('id IN (:...ids)', {
                                ids: ids.map((id) => Number.parseInt(id)),
                            });
                        }
                    }),
                )
                .skip((page - 1) * limit)
                .take(limit)
                .orderBy({
                    [orderBy]: orderDirection,
                })
                .select(attributes.map((a) => `c.${a}`))
                .getManyAndCount();
            return {
                items: categories || [],
                totalItems: count,
            };
        } catch (error) {
            this.logger.error('Error in getCategoryList service', error);
            throw error;
        }
    }

    async getAllCategories(attributes = categoryListAttributes) {
        try {
            const categories = await this.categoryRepository.find({
                select: attributes as FindOptionsSelect<Category>,
            });
            return categories;
        } catch (error) {
            this.logger.error('Error in getAllCategories service', error);
            throw error;
        }
    }
}
