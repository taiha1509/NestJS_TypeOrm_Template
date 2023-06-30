import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { baseColumnConfig } from '../constants';
import { UserOTPType } from '../../modules/auth/auth.constant';

export class CreateUserOTPTable1686640100408 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_otps',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'userId',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'expiredAt',
                        type: 'timestamp',
                        isNullable: false,
                    },
                    {
                        name: 'value',
                        type: 'varchar(6)',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: Object.values(UserOTPType),
                        default: `"${UserOTPType.RESET_PASSWORD}"`,
                    },
                    {
                        name: 'isVerified',
                        type: 'boolean',
                        default: false,
                    },
                    ...baseColumnConfig,
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_otps', true);
    }
}
