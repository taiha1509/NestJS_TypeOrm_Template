import { MysqlBaseEntity } from './base.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductCategory } from './product-category';

@Entity({
    name: 'categories',
})
export class Category extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'varchar' })
    description: string;

    @ManyToMany(() => Product, (p) => p.categories)
    products: Product[];

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    productCategory?: ProductCategory;
}
