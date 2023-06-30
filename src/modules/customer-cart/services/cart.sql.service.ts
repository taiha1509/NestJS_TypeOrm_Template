import { createWinstonLogger } from '@/common/services/winston.service';
import { CustomerCartItem } from '@/mysql-entity/customer-cart-item.entity';
import { CustomerCart } from '@/mysql-entity/customer-cart.entity';
import { Product } from '@/mysql-entity/product.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
    cartAttributes,
    cartItemAttributes,
    MODULE_NAME,
} from '../cart.constant';
import {
    OrderDirection,
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_ALL,
} from '@/common/constants';
import { productListAttributes } from '@/modules/product/product.constant';

@Injectable()
export class CartSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(CustomerCart)
        private readonly cartRepository: Repository<CustomerCart>,
        @InjectRepository(CustomerCartItem)
        private readonly cartItemRepository: Repository<CustomerCartItem>,
        private readonly dataSource: DataSource,
    ) {}

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    public async getCustomerCart(
        customerId: number,
        query?: { page: number; limit: number },
    ) {
        try {
            const { page = DEFAULT_FIRST_PAGE, limit = DEFAULT_LIMIT_FOR_ALL } =
                query;
            const cart = await this.cartRepository.findOne({
                where: { customerId },
                select: ['id', 'customerId', 'shippingFee'],
            });

            // cart is not created
            if (!cart) {
                return null;
            }
            const [items, totalItems] = await this.cartItemRepository
                .createQueryBuilder('ci')
                .leftJoinAndMapOne(
                    'ci.product',
                    Product,
                    'p',
                    'p.id = ci.productId',
                )
                .where('ci.cartId = cartId', { cartId: cart.id })
                .skip((page - 1) * limit)
                .take(limit)
                .select([
                    ...cartItemAttributes.map((attr) => `ci.${attr}`),
                    ...productListAttributes.map((attr) => `p.${attr}`),
                ])
                .orderBy({
                    'p.createdAt': OrderDirection.DESC,
                })
                .getManyAndCount();

            return {
                cartId: cart.id,
                shippingFee: cart.shippingFee,
                items,
                totalItems,
            };
        } catch (error) {
            this.logger.error(`Error in getCustomerCart service, ${error}`);
            throw error;
        }
    }

    public async addProductToCart(
        customerId: number,
        productId,
        quantity: number,
    ) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();
            const cartExist = await this.cartRepository.exist({
                where: { customerId },
            });
            let cartId: number;
            if (!cartExist) {
                const insertResult = await queryRunner.manager
                    .getRepository(CustomerCart)
                    .insert({
                        customerId,
                        // TODO fix this
                        shippingFee: 0,
                    });
                cartId = insertResult.identifiers?.[0]?.id;
            } else {
                cartId = (
                    await this.cartRepository.findOne({
                        where: { customerId },
                        select: ['id'],
                    })
                )?.id;
            }

            const insertItemResult = await queryRunner.manager
                .getRepository(CustomerCartItem)
                .insert({ cartId, productId, quantity });

            await queryRunner.commitTransaction();

            return {
                cartId,
                itemId: insertItemResult?.identifiers?.[0]?.id,
            };
        } catch (error) {
            this.logger.error(`Error in addProductToCart service, ${error}`);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            queryRunner.release();
        }
    }

    async checkProductExistInCart(productId: number, customerId: number) {
        try {
            return await this.cartItemRepository
                .createQueryBuilder('ci')
                .leftJoin(CustomerCart, 'cc', 'cc.id = ci.cartId')
                .where('cc.customerId = :customerId', { customerId })
                .where('ci.productId = :productId', { productId })
                .getExists();
        } catch (error) {
            this.logger.error(
                `Error in checkProductExistInCart service, ${error}`,
            );
            throw error;
        }
    }

    async removeProductFromCart(productId: number, customerId: number) {
        try {
            const cartItem = await this.cartItemRepository
                .createQueryBuilder('ci')
                .leftJoin(CustomerCart, 'cc', 'cc.id = ci.cartId')
                .where('cc.customerId = :customerId', {
                    customerId,
                })
                .andWhere('ci.productId = :productId', {
                    productId,
                })
                .select(['ci.id'])
                .getOne();
            await this.cartItemRepository.softDelete({ id: cartItem.id });
        } catch (error) {
            this.logger.error(
                `Error in removeProductFromCart service, ${error}`,
            );
            throw error;
        }
    }

    async updateProductInCart(
        productId: number,
        customerId: number,
        quantity: number,
    ) {
        try {
            const cartItem = await this.cartItemRepository
                .createQueryBuilder('ci')
                .leftJoin(CustomerCart, 'cc', 'cc.id = ci.cartId')
                .where('cc.customerId = :customerId', {
                    customerId,
                })
                .andWhere('ci.productId = :productId', {
                    productId,
                })
                .getOne();
            if (cartItem) {
                cartItem.quantity = quantity;
                await this.cartItemRepository.save(cartItem);
            }
        } catch (error) {
            this.logger.error(`Error in updateProductInCart service, ${error}`);
            throw error;
        }
    }
}
