import {
    ProductColor,
    ProductSize,
} from '../../modules/product/product.constant';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterProductTable1687230913998 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('products', [
            new TableColumn({
                name: 'size',
                type: 'enum',
                enum: Object.values(ProductSize),
            }),
            new TableColumn({
                name: 'color',
                type: 'enum',
                enum: Object.values(ProductColor),
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns('products', ['size', 'color']);
    }
}
