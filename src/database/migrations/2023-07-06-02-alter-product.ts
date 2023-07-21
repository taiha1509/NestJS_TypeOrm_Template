import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterProductTable1688612261704 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'imageUrl');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'imageUrl',
                type: 'varchar',
                isNullable: true,
            }),
        );
    }
}
