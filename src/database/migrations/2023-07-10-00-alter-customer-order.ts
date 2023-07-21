import { UserRole, UserStatus } from '../../modules/user/user.constant';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterCustomerOrderTable1688965688945
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'customer_orders',
            new TableColumn({
                name: 'isPaid',
                type: 'boolean',
                isNullable: false,
                default: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('customer_orders', 'isPaid');
    }
}
