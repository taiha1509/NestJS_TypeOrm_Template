import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateCustomerCartItemTable1687231199259
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'customer_cart_items',
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
                        name: 'cartId',
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
                        columnNames: ['cartId'],
                        name: 'cartId_index',
                    },
                    {
                        columnNames: ['productId'],
                        name: 'productId_index',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('customer_cart_items', true);
    }
}
