import {
    CustomerOrderStatus,
    PaymentMethod,
} from '../../modules/order/order.constant';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateOrderProductTable1687769581005
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'order_products',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'productId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'orderId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'quantity',
                        type: 'int',
                        isNullable: false,
                    },
                    ...baseColumnConfig,
                ],
                indices: [
                    {
                        columnNames: ['productId'],
                        name: 'productId_index',
                    },
                    {
                        columnNames: ['orderId'],
                        name: 'orderId_index',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('order_products', true);
    }
}
