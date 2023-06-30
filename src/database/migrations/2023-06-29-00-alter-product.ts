import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterProductTable1688032014577 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('products', [
            new TableColumn({
                name: 'description',
                type: 'varchar(2000)',
                isNullable: true,
            }),
            new TableColumn({
                name: 'material',
                type: 'varchar(255)',
                isNullable: true,
            }),
            new TableColumn({
                name: 'usageInstruction',
                type: 'varchar(2000)',
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns('products', [
            'description',
            'material',
            'usageInstruction',
        ]);
    }
}
