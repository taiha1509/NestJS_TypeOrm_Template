import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateProductFeedbackTable1688099362751
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'product_feedbacks',
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
                        name: 'customerId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'rating',
                        type: 'tinyint',
                        isNullable: false,
                    },
                    {
                        name: 'comment',
                        type: 'varchar(2000)',
                        isNullable: false,
                    },
                    ...baseColumnConfig,
                ],
                indices: [
                    {
                        columnNames: ['customerId'],
                        name: 'customerId_index',
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
        await queryRunner.dropTable('product_feedbacks', true);
    }
}
