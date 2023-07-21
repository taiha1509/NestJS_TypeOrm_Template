import { Product } from '../../mysql-entity/product.entity';
import { In, MigrationInterface, QueryRunner } from 'typeorm';
import {
    ProductColor,
    ProductSize,
    ProductStatus,
} from '../../modules/product/product.constant';

const products = [
    {
        name: 'Vợt Cầu Lông Felet Woven TJ 1000 Speed Chính Hãng',
        quantity: 50,
        price: 1500,
        status: ProductStatus.SELLING,
        createdAt: new Date(),
        updatedAt: new Date(),
        size: [ProductSize.L],
        color: [ProductColor.BLACK],
    },
    {
        name: 'Vợt Cầu Lông Felet Woven TJ 1000 Speed Chính Hãng loại 1',
        quantity: 60,
        price: 1600,
        status: ProductStatus.SELLING,
        createdAt: new Date(),
        updatedAt: new Date(),
        size: [ProductSize.L],
        color: [ProductColor.BLACK],
    },
    {
        name: 'Vợt Cầu Lông Felet Woven TJ 1000 Speed Chính Hãng loại 2',
        quantity: 70,
        price: 1700,
        status: ProductStatus.SELLING,
        createdAt: new Date(),
        updatedAt: new Date(),
        size: [ProductSize.L],
        color: [ProductColor.BLACK],
    },
];

export class Product1685596635799 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.connection
            .getRepository(Product)
            .createQueryBuilder('p')
            .insert()
            .into(Product)
            .values([...products])
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const productRepo = await queryRunner.connection.getRepository(
            'products',
        );
        await productRepo.delete({
            name: In(products.map((product) => product.name)),
        });
    }
}
