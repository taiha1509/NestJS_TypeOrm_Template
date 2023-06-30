import { UserGender, UserStatus } from '../../modules/user/user.constant';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateUserTable1685596635793 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'email',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'birthday',
                        type: 'date',
                        isNullable: true,
                    },
                    {
                        name: 'address',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'gender',
                        type: 'enum',
                        isNullable: true,
                        enum: Object.values(UserGender),
                    },
                    {
                        name: 'phoneNumber',
                        type: 'varchar(50)',
                        isNullable: true,
                    },
                    {
                        name: 'description',
                        type: 'varchar(2000)',
                        isNullable: true,
                    },
                    {
                        name: 'avatarId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        isNullable: false,
                        default: `"${UserStatus.REGISTERING}"`,
                        enum: Object.values(UserStatus),
                    },
                    ...baseColumnConfig,
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users', true);
    }
}
