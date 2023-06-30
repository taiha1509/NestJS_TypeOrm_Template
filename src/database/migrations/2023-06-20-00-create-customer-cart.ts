import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateCustomerCartTable1687230332512
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'customer_carts',
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
                        name: 'shippingFee',
                        type: 'int',
                        isNullable: false,
                    },
                    ...baseColumnConfig,
                ],
                indices: [
                    {
                        columnNames: ['customerId'],
                        name: 'customerId_index',
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('customer_carts', true);
    }
}
