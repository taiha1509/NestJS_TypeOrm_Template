import {
    ProductColor,
    ProductSize,
} from '../../modules/product/product.constant';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterProductTable1688098440666 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumns('products', [
            {
                oldColumn: new TableColumn({
                    name: 'size',
                    type: 'enum',
                    enum: Object.values(ProductSize),
                }),
                newColumn: new TableColumn({
                    name: 'size',
                    type: 'json',
                    isNullable: false,
                }),
            },
            {
                oldColumn: new TableColumn({
                    name: 'color',
                    type: 'enum',
                    enum: Object.values(ProductColor),
                }),
                newColumn: new TableColumn({
                    name: 'color',
                    type: 'json',
                    isNullable: false,
                }),
            },
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumns('products', [
            {
                newColumn: new TableColumn({
                    name: 'size',
                    type: 'enum',
                    enum: Object.values(ProductSize),
                }),
                oldColumn: new TableColumn({
                    name: 'size',
                    type: 'json',
                    isNullable: false,
                }),
            },
            {
                newColumn: new TableColumn({
                    name: 'color',
                    type: 'enum',
                    enum: Object.values(ProductColor),
                }),
                oldColumn: new TableColumn({
                    name: 'color',
                    type: 'json',
                    isNullable: false,
                }),
            },
        ]);
    }
}
