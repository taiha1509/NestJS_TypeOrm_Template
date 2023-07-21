import { categoryListAttributes } from '@/modules/category/category.constant';
import { Category } from '@/mysql-entity/category.entity';
import { CustomerCart } from '@/mysql-entity/customer-cart.entity';
import { ProductCategory } from '@/mysql-entity/product-category';
import { ProductFeedback } from '@/mysql-entity/product-feedback.entity';
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
import {
    IProductListQuery,
    IUserFeedbackProductDTO,
} from '../product.interface';

@Injectable()
export class ProductFeedbackSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductFeedback)
        private readonly productFeedbackRepository: Repository<ProductFeedback>,
        @InjectRepository(CustomerCart)
        private readonly customerCartRepository: Repository<CustomerCart>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async checkCustomerProvidedFeedback(userId: number, productId: number) {
        try {
            return await this.productFeedbackRepository.exist({
                where: { customerId: userId, productId },
            });
        } catch (error) {
            this.logger.error(
                'Error in checkCustomerProvidedFeedback service',
                error,
            );
            throw error;
        }
    }

    async feedbackProduct(
        productId: number,
        userId,
        data: IUserFeedbackProductDTO,
    ) {
        try {
            const insertResult = await this.productFeedbackRepository.save({
                comment: data.comment,
                rating: data.rating,
                createdBy: userId,
                updatedBy: userId,
                customerId: userId,
                productId,
            });

            return insertResult.id;
        } catch (error) {
            this.logger.error('Error in feedbackProduct service', error);
            throw error;
        }
    }
}
