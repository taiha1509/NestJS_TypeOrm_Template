import { Category } from '@/mysql-entity/category.entity';
import { CustomerCartItem } from '@/mysql-entity/customer-cart-item.entity';
import { CustomerProductWishList } from '@/mysql-entity/customer-product-wishlist';
import { File } from '@/mysql-entity/file.entity';
import { ProductCategory } from '@/mysql-entity/product-category';
import { ProductFeedback } from '@/mysql-entity/product-feedback.entity';
import { ProductFile } from '@/mysql-entity/product-file.entity';
import { Product } from '@/mysql-entity/product.entity';
import { User } from '@/mysql-entity/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createWinstonLogger } from '@/common/services/winston.service';
import { DataSource, In, Not, Repository } from 'typeorm';
import { MODULE_NAME } from '../product.constant';
import { ICreateProductDTO, IUpdateProductDTO } from '../product.interface';

@Injectable()
export class ProductCmsSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
        @InjectRepository(ProductFile)
        private readonly productFileRepository: Repository<ProductFile>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ProductFeedback)
        private readonly productFeedbackRepository: Repository<ProductFeedback>,
        private readonly dataSource: DataSource,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );
    async checkCategoryIdsValid(ids: number[]) {
        try {
            return (
                (await this.categoryRepository.count({
                    where: { id: In(ids) },
                })) == ids.length
            );
        } catch (error) {
            this.logger.error('Error in checkCategoryIdsValid service', error);
            throw error;
        }
    }

    async updateProduct(productId: number, data: IUpdateProductDTO) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();
            const updatedProduct = await queryRunner.manager
                .getRepository(Product)
                .save({
                    id: productId,
                    name: data.name,
                    createdBy: data.updatedBy,
                    material: data.material,
                    price: data.price,
                    description: data.description,
                    quantity: data.quantity,
                    status: data.status,
                    usageInstruction: data.usageInstruction,
                });
            if (data.categoryIds.length > 0) {
                await Promise.all([
                    // delete
                    queryRunner.manager.getRepository(ProductCategory).update(
                        { productId: updatedProduct.id },
                        {
                            deletedAt: new Date(),
                            deletedBy: data.updatedBy,
                        },
                    ),
                    // upsert
                    queryRunner.manager.getRepository(ProductCategory).save([
                        ...data.categoryIds.map((id) => ({
                            productId: updatedProduct.id,
                            categoryId: id,
                            // TODO update this value
                            priorityOrder: 1,
                        })),
                    ]),
                ]);
            }

            if (data.images?.length > 0) {
                const productFileIds = (
                    await queryRunner.manager.getRepository(ProductFile).find({
                        where: {
                            productId,
                        },
                        select: ['fileId'],
                    })
                )?.map((record) => record.fileId);
                await Promise.all([
                    // soft delete unuse files records
                    queryRunner.manager.getRepository(File).update(
                        {
                            id: In(productFileIds),
                        },
                        {
                            deletedAt: new Date(),
                            deletedBy: data.updatedBy,
                        },
                    ),

                    // product_files records
                    // delete
                    queryRunner.manager.getRepository(ProductFile).update(
                        { productId },
                        {
                            deletedAt: new Date(),
                            deletedBy: data.updatedBy,
                        },
                    ),
                    // insert
                    queryRunner.manager.getRepository(ProductFile).insert(
                        data.images.map((image) => ({
                            productId,
                            fileId: image.imageId,
                            order: image.order,
                            updatedBy: data.updatedBy,
                        })),
                    ),
                ]);
            }
            await queryRunner.commitTransaction();
            return updatedProduct;
        } catch (error) {
            this.logger.error(`Error in updateProduct service, ${error}`);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            queryRunner.release();
        }
    }

    async createProduct(data: ICreateProductDTO) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();
            const insertedProduct = await queryRunner.manager
                .getRepository(Product)
                .save({
                    name: data.name,
                    color: data.color,
                    size: data.size,
                    createdBy: data.createdBy,
                    material: data.material,
                    price: data.price,
                    description: data.description,
                    quantity: data.quantity,
                    status: data.status,
                    usageInstruction: data.usageInstruction,
                });
            if (data.categoryIds.length > 0) {
                await queryRunner.manager.getRepository(ProductCategory).save([
                    ...data.categoryIds.map((id) => ({
                        productId: insertedProduct.id,
                        categoryId: id,
                        priorityOrder: 1,
                        createdBy: data.createdBy,
                    })),
                ]);
            }
            if (data.images?.length > 0) {
                await queryRunner.manager.getRepository(ProductFile).insert(
                    data.images.map((image) => ({
                        productId: insertedProduct.id,
                        fileId: image.imageId,
                        order: image.order,
                        createdBy: data.createdBy,
                    })),
                );
            }
            await queryRunner.commitTransaction();
            return insertedProduct.id;
        } catch (error) {
            this.logger.error(`Error in createProduct service, ${error}`);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            queryRunner.release();
        }
    }

    async deleteProductById(productId: number, userId: number) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();
            const dateNow = new Date();
            const results = await Promise.all([
                // get fileIds
                queryRunner.manager.getRepository(ProductFile).find({
                    where: {
                        productId,
                    },
                    select: ['fileId'],
                }),
                // delete product
                queryRunner.manager.getRepository(Product).update(
                    { id: productId },
                    {
                        deletedAt: dateNow,
                        deletedBy: userId,
                    },
                ),

                // delete product_files records
                queryRunner.manager.getRepository(ProductFile).update(
                    { productId },
                    {
                        deletedAt: dateNow,
                        deletedBy: userId,
                    },
                ),

                // delete product_categories records
                queryRunner.manager.getRepository(ProductCategory).update(
                    { productId },
                    {
                        deletedAt: dateNow,
                        deletedBy: userId,
                    },
                ),

                // delete customer_cart_items records
                queryRunner.manager.getRepository(CustomerCartItem).update(
                    { productId },
                    {
                        deletedAt: dateNow,
                        deletedBy: userId,
                    },
                ),
                //delete customer_product_wishlist records
                queryRunner.manager
                    .getRepository(CustomerProductWishList)
                    .update(
                        { productId },
                        {
                            deletedAt: dateNow,
                            deletedBy: userId,
                        },
                    ),
            ]);

            // delete file records
            await queryRunner.manager.getRepository(File).update(
                { id: In(results[0].map((pFile) => pFile.fileId)) },
                {
                    deletedAt: dateNow,
                    deletedBy: userId,
                },
            ),
                // TODO update shipping fee in carts
                await queryRunner.commitTransaction();

            return productId;
        } catch (error) {
            this.logger.error(`Error in deleteProductById service, ${error}`);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            queryRunner.release();
        }
    }

    async checkImageIsAvailable(ids: number[]) {
        try {
            if (!ids.length) return true;
            const [productImageCount, avatarImageCount] = await Promise.all([
                this.productFileRepository
                    .createQueryBuilder('pf')
                    .leftJoin(File, 'f', 'pf.fileId = f.id')
                    .where('f.id IN (:fileIds)', {
                        fileIds: ids,
                    })
                    .getCount(),
                this.userRepository
                    .createQueryBuilder('u')
                    .leftJoin(File, 'f', 'u.avatarId = f.id')
                    .where('f.id IN (:fileIds)', {
                        fileIds: ids,
                    })
                    .getCount(),
            ]);

            return productImageCount + avatarImageCount === ids.length;
        } catch (error) {
            this.logger.error(
                `Error in checkImageIsAvailable service, ${error}`,
            );
            throw error;
        }
    }
}
