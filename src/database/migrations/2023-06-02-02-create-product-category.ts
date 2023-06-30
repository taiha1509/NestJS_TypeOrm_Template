import { ProductStatus } from '../../modules/product/product.constant';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateProductCategoryTable1685596635797
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'product_categories',
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
                        name: 'categoryId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'priorityOrder',
                        type: 'int',
                        isNullable: false,
                    },
                    ...baseColumnConfig,
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('product_categories', true);
    }
}
