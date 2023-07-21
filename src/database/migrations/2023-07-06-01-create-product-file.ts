import { ProductImageType } from '../../modules/product/product.constant';
import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateProductFileTable1688612261703 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'product_files',
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
                        name: 'fileId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'order',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        isNullable: false,
                        enum: Object.values(ProductImageType),
                    },
                    ...baseColumnConfig,
                ],
                indices: [
                    {
                        columnNames: ['productId'],
                        name: 'productId_index',
                    },
                    {
                        columnNames: ['fileId'],
                        name: 'fileId_index',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('product_files', true);
    }
}
