import { baseColumnConfig } from '../constants';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { UserTokenType } from '../../modules/auth/auth.constant';

export class CreateUserTokenTable1685596635794 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_tokens',
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
                        name: 'token',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'hashToken',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: Object.values(UserTokenType),
                        isNullable: false,
                    },
                    ...baseColumnConfig,
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_tokens', true);
    }
}
