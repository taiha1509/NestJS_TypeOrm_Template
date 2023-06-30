import {
    CustomerOrderStatus,
    PaymentMethod,
} from '../../modules/order/order.constant';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateCustomerOrderTable1687769581004
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'customer_orders',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'phoneNumber',
                        type: 'varchar(50)',
                        isNullable: false,
                    },
                    {
                        name: 'customerName',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'code',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'customerId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'address',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'province',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'district',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'ward',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'note',
                        type: 'varchar(2000)',
                        isNullable: true,
                    },
                    {
                        name: 'paymentMethod',
                        type: 'enum',
                        enum: Object.values(PaymentMethod),
                        isNullable: false,
                    },
                    {
                        name: 'paymentDetail',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'shippingFee',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: Object.values(CustomerOrderStatus),
                        isNullable: false,
                    },
                    {
                        name: 'items',
                        type: 'json',
                        isNullable: true,
                        comment: 'Product list information in this order',
                    },
                    ...baseColumnConfig,
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('customer_orders', true);
    }
}
