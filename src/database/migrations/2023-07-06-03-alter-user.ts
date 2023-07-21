import { UserRole, UserStatus } from '../../modules/user/user.constant';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterUserTable1688956348682 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await Promise.all([
            queryRunner.addColumn(
                'users',
                new TableColumn({
                    name: 'role',
                    type: 'enum',
                    enum: Object.values(UserRole),
                    isNullable: false,
                }),
            ),
            queryRunner.changeColumn(
                'users',
                'status',
                new TableColumn({
                    name: 'status',
                    type: 'enum',
                    enum: Object.values(UserStatus),
                    isNullable: false,
                }),
            ),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await Promise.all([
            queryRunner.dropColumn('users', 'role'),
            queryRunner.changeColumn(
                'users',
                'status',
                new TableColumn({
                    name: 'status',
                    type: 'enum',
                    enum: [UserStatus.ACTIVE, UserStatus.REGISTERING],
                    isNullable: false,
                }),
            ),
        ]);
    }
}
