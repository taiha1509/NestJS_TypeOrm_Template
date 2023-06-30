import { Category } from '../../mysql-entity/category.entity';
import { In, MigrationInterface, QueryRunner } from 'typeorm';

const categories = [
    {
        name: 'Vợt Cầu Lông',
        description: 'For test purpose, remove me later',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Quần thun',
        description: 'For test purpose, remove me later',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Áo sơ mi',
        description: 'For test purpose, remove me later',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export class Category1685596635798 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.connection
            .getRepository(Category)
            .createQueryBuilder('c')
            .insert()
            .into(Category)
            .values([...categories])
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const categoryRepo = await queryRunner.connection.getRepository(
            'categories',
        );
        const response = await categoryRepo.delete({
            name: In(categories.map((user) => user.name)),
            description: In(categories.map((user) => user.description)),
        });
    }
}
