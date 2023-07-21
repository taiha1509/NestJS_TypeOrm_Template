import {
    categoryListAttributes,
    MODULE_NAME,
} from '@/modules/category/category.constant';
import { Category } from '@/mysql-entity/category.entity';
import { ProductCategory } from '@/mysql-entity/product-category';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createWinstonLogger } from '@/common/services/winston.service';
import {
    Brackets,
    DataSource,
    FindOptionsSelect,
    Not,
    Repository,
} from 'typeorm';
import { ICreateCategoryDTO, IUpdateCategoryDTO } from '../category.interface';

@Injectable()
export class CategoryCmsSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        private readonly dataSource: DataSource,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getCategoryById(id: number, attributes = categoryListAttributes) {
        try {
            return await this.categoryRepository.findOne({
                where: { id },
                select: attributes as FindOptionsSelect<Category>,
            });
        } catch (error) {
            this.logger.error('Error in getCategoryById service', error);
            throw error;
        }
    }

    async checkCategoryExistByName(name: string, id?: number) {
        try {
            return await this.categoryRepository.exist({
                where: { name, id: Not(id) },
            });
        } catch (error) {
            this.logger.error(
                'Error in checkCategoryExistByName service',
                error,
            );
            throw error;
        }
    }

    async checkCategoryExistById(id: number) {
        try {
            return await this.categoryRepository.exist({
                where: { id: id },
            });
        } catch (error) {
            this.logger.error('Error in checkCategoryExistById service', error);
            throw error;
        }
    }

    async createCategory(data: ICreateCategoryDTO) {
        try {
            const insertResult = await this.categoryRepository.insert({
                name: data.name,
                description: data.description,
                createdBy: data.createdBy,
            });

            return insertResult.identifiers?.[0]?.id;
        } catch (error) {
            this.logger.error('Error in createCategory service', error);
            throw error;
        }
    }

    async updateCategory(id: number, data: IUpdateCategoryDTO) {
        try {
            await this.categoryRepository.update(
                { id },
                {
                    name: data.name,
                    description: data.description,
                    updatedBy: data.updatedBy,
                    updatedAt: new Date(),
                },
            );

            return await this.getCategoryById(id);
        } catch (error) {
            this.logger.error('Error in updateCategory service', error);
            throw error;
        }
    }

    async deleteCategoryById(id: number, userId: number) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();
            const dateNow = new Date();
            await Promise.all([
                queryRunner.manager
                    .getRepository(Category)
                    .update({ id }, { deletedAt: dateNow, deletedBy: userId }),
                queryRunner.manager.getRepository(ProductCategory).update(
                    { categoryId: id },
                    {
                        deletedAt: dateNow,
                        deletedBy: userId,
                    },
                ),
            ]);

            await queryRunner.commitTransaction();

            return id;
        } catch (error) {
            this.logger.error(`Error in deleteCategoryById service, ${error}`);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            queryRunner.release();
        }
    }
}
