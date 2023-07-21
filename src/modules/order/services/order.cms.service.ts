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
    IGetAdminOrderListQuery,
    IUpdateAdminOrderDTO,
    ICreateCustomerOrderDTO,
    IGetOrderListQuery,
} from '../order.interface';

@Injectable()
export class OrderCmsSqlService {
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

    async getOrderDetail(orderId: number, attributes = orderDetailAttributes) {
        try {
            const order = await this.orderRepository
                .createQueryBuilder('o')
                .andWhere('o.id = :orderId', { orderId })
                .select([...attributes.map((a) => `o.${a}`)])
                .getOne();
            if (!order) return null;
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
        query: IGetAdminOrderListQuery,
        attributes = orderListAttributes,
    ) {
        try {
            const {
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = OrderDirection.DESC,
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
                statuses,
                isPaid = null,
            } = query;

            const qb = this.orderRepository
                .createQueryBuilder('o')
                .where(
                    new Brackets((qb) => {
                        if (statuses && statuses?.length) {
                            qb.orWhere('o.status IN (:statuses)', { statuses });
                        }
                        if (isPaid != null) {
                            qb.orWhere('o.isPaid = :isPaid', {
                                isPaid: isPaid === 'true' ? true : false,
                            });
                        }
                    }),
                )
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

    async checkOrderExistById(id: number) {
        try {
            return await this.orderRepository.exist({
                where: { id },
            });
        } catch (error) {
            this.logger.error(`Error in checkOrderExistById service`);
            throw error;
        }
    }

    async updateOrder(id: number, data: IUpdateAdminOrderDTO) {
        try {
            await this.orderRepository.update(
                { id },
                {
                    ...data,
                },
            );

            return await this.getOrderDetail(id);
        } catch (error) {
            this.logger.error(`Error in updateOrder service`);
            throw error;
        }
    }
}
