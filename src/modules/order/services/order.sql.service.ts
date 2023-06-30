import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    OrderDirection,
} from '@/common/constants';
import { createWinstonLogger } from '@/common/services/winston.service';
import { cartItemAttributes } from '@/modules/customer-cart/cart.constant';
import { productListAttributes } from '@/modules/product/product.constant';
import { CustomerCartItem } from '@/mysql-entity/customer-cart-item.entity';
import { CustomerCart } from '@/mysql-entity/customer-cart.entity';
import { CustomerOrder } from '@/mysql-entity/customer-order.entity';
import { OrderProduct } from '@/mysql-entity/order-product.entity';
import { Product } from '@/mysql-entity/product.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Brackets,
    DataSource,
    FindOptionsSelect,
    In,
    Repository,
} from 'typeorm';
import {
    CustomerOrderStatus,
    MODULE_NAME,
    orderDetailAttributes,
    orderListAttributes,
} from '../order.constant';
import {
    ICreateCustomerOrderDTO,
    IGetOrderListQuery,
} from '../order.interface';

@Injectable()
export class OrderSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(CustomerCart)
        private readonly cartRepository: Repository<CustomerCart>,
        @InjectRepository(CustomerOrder)
        private readonly orderRepository: Repository<CustomerOrder>,
        @InjectRepository(CustomerCartItem)
        private readonly cartItemRepository: Repository<CustomerCartItem>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly dataSource: DataSource,
    ) {}

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getOrderDetail(
        userId: number,
        orderId: number,
        attributes = orderDetailAttributes,
    ) {
        try {
            const order = await this.orderRepository
                .createQueryBuilder('o')
                .where('o.customerId = :customerId', { customerId: userId })
                .andWhere('o.id = :orderId', { orderId })
                .select([...attributes.map((a) => `o.${a}`)])
                .getOne();
            return {
                ...order,
                items: order.items,
                _items: undefined,
            };
        } catch (error) {
            this.logger.error(`Error in getOrderDetail service`);
            throw error;
        }
    }

    async getOrderList(
        query: IGetOrderListQuery,
        userId: number,
        attributes = orderListAttributes,
    ) {
        try {
            const {
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = OrderDirection.DESC,
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                status,
            } = query;

            const qb = this.orderRepository
                .createQueryBuilder('o')
                .where(
                    new Brackets((qb) => {
                        if (status) {
                            qb.orWhere('o.status = :status', { status });
                        }
                    }),
                )
                .andWhere('o.customerId = :customerId', { customerId: userId })
                .take(limit)
                .skip((page - 1) * limit)
                .orderBy(`o.${orderBy}`, orderDirection)
                .select([...attributes.map((a) => `o.${a}`), 'items']);

            const [items, totalItems] = await qb.getManyAndCount();

            return {
                items: items.map((i) => ({
                    ...i,
                    items: i.items,
                    _items: undefined,
                })),
                totalItems,
            };
        } catch (error) {
            this.logger.error(`Error in getOrderList service`);
            throw error;
        }
    }

    async getProductListInCartByUserId(
        userId: number,
        attributes = productListAttributes,
    ) {
        try {
            return await this.productRepository
                .createQueryBuilder('p')
                .leftJoinAndMapOne(
                    'p.cartItem',
                    CustomerCartItem,
                    'ci',
                    'ci.productId = p.id',
                )
                .leftJoin(CustomerCart, 'cc', 'cc.id = ci.cartId')
                .where('cc.customerId = :userId', { userId })
                .select([
                    ...attributes.map((a) => `p.${a}`),
                    ...cartItemAttributes.map((a) => `ci.${a}`),
                ])
                .getMany();
        } catch (error) {
            this.logger.error(`Error in getProductListInCartByUserId service`);
            throw error;
        }
    }

    async createOrder(
        data: ICreateCustomerOrderDTO,
        shippingFee: number,
        productIdToQuantityInCartMapping: Map<number, number>,
        userId: number,
        cartId: number,
        productListInCart: Product[],
    ) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();

            // create order record
            const createOrderResult = await queryRunner.manager
                .getRepository(CustomerOrder)
                .insert({
                    phoneNumber: data.phoneNumber,
                    address: data.address,
                    customerId: userId || null,
                    customerName: data.customerName,
                    items: productListInCart.map((p) => ({
                        ...p,
                        quantity: productIdToQuantityInCartMapping.get(p.id),
                    })),
                    ward: data.ward,
                    district: data.district,
                    province: data.province,
                    paymentMethod: data.paymentMethod,
                    paymentDetail: data.paymentDetail || null,
                    createdBy: userId || null,
                    note: data.note,
                    shippingFee,
                    code: data.code,
                    status: CustomerOrderStatus.WAITING_FOR_CONFIRMATION,
                });
            const orderId = createOrderResult.identifiers?.[0]?.id;
            const taskList = [];
            // create order_product records
            taskList.push(
                queryRunner.manager.getRepository(OrderProduct).save(
                    productListInCart.map((p) => ({
                        orderId,
                        productId: p.id,
                        quantity: productIdToQuantityInCartMapping.get(p.id),
                        createdBy: userId || null,
                    })),
                ),
            );

            // soft delete corresponding cart, cart_items record
            taskList.push(
                queryRunner.manager.getRepository(CustomerCart).softDelete({
                    id: cartId,
                }),
                queryRunner.manager.getRepository(CustomerCartItem).softDelete({
                    cartId: cartId,
                }),
            );

            // update product quantity of list product in this order
            const updateQuantityCondition = productListInCart
                .map(
                    (product) =>
                        `WHEN id = ${
                            product.id
                        } THEN quantity - ${productIdToQuantityInCartMapping.get(
                            product.id,
                        )} `,
                )
                .join('');
            taskList.push(
                queryRunner.manager.query(
                    `UPDATE products SET quantity = (
                        CASE
                            ${updateQuantityCondition}
                        END
                    )
                    WHERE id IN (?)`,
                    [productListInCart.map((p) => p.id)],
                ),
            );
            await Promise.all(taskList);
            await queryRunner.commitTransaction();
            return orderId;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error in createOrder service, ${error}`);
            throw error;
        } finally {
            queryRunner.release();
        }
    }
}
