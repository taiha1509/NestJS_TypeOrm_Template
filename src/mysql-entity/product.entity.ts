import { MysqlBaseEntity } from './base.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
} from 'typeorm';
import {
    ProductColor,
    ProductSize,
    ProductStatus,
} from '../modules/product/product.constant';
import { Category } from './category.entity';
import { CustomerCart } from './customer-cart.entity';
import { CustomerCartItem } from './customer-cart-item.entity';
import { CustomerOrder } from './customer-order.entity';
import { ProductFeedback } from './product-feedback.entity';
import { File } from './file.entity';
import { CustomerProductWishList } from './customer-product-wishlist';

@Entity({
    name: 'products',
})
export class Product extends MysqlBaseEntity {
    @Column()
    name: string;

    @Column({ nullable: false, type: 'int' })
    quantity: number;

    @Column({
        nullable: false,
        type: 'json',
    })
    size: ProductSize[];

    @Column({
        nullable: false,
        type: 'json',
    })
    color: ProductColor[];

    @Column({
        default: ProductStatus.SELLING,
        type: 'enum',
        enum: Object.values(ProductStatus),
    })
    status: ProductStatus;

    @Column({
        nullable: false,
        type: 'int',
    })
    price: number;

    @Column({ nullable: true, type: 'varchar' })
    description: string;

    @Column({ nullable: true, type: 'varchar' })
    material: string;

    @Column({ nullable: true, type: 'varchar' })
    usageInstruction: string;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    @ManyToMany(() => Category, (c) => c.products)
    @JoinTable()
    categories: Category[];

    @ManyToMany(() => CustomerCart, (cc) => cc.products)
    carts: CustomerCart[];

    @ManyToMany(() => CustomerOrder, (o) => o.products)
    orders: CustomerOrder[];

    @OneToOne(() => CustomerCartItem, (cartItem) => cartItem.product)
    cartItem: CustomerCartItem;

    @OneToMany(() => ProductFeedback, (pr) => pr.product)
    feedbacks: ProductFeedback[];

    @ManyToMany(() => File, (f) => f.products)
    @JoinTable()
    images: File[];

    customerProductWishList?: CustomerProductWishList[];
}
