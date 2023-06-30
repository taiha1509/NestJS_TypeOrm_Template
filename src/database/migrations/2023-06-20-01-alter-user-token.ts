import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterUserTokenTable1687230913999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'user_tokens',
            'token',
            new TableColumn({
                name: 'token',
                type: 'varchar(2000)',
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'user_tokens',
            'token',
            new TableColumn({
                name: 'token',
                type: 'varchar(255)',
                isNullable: false,
            }),
        );
    }
}
