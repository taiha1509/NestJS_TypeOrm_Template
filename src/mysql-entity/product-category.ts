import { MysqlBaseEntity } from './base.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Entity({
    name: 'product_categories',
})
export class ProductCategory extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'int' })
    productId: number;

    @Column({ nullable: false, type: 'int' })
    categoryId: number;

    @Column({ nullable: false, type: 'int' })
    priorityOrder: number;

    products: Product[];

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    category?: Category;
}
