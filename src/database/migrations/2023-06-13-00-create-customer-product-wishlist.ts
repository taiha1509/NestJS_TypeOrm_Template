import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CustomerProductWishlist1686628344318
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'customer_product_wishlist',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'customerId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'productId',
                        type: 'int',
                        isNullable: false,
                    },
                    ...baseColumnConfig,
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('customer_product_wishlist', true);
    }
}
