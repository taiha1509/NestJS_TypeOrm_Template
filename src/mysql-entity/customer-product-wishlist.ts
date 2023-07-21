import { MysqlBaseEntity } from './base.entity';
import { Column, DeleteDateColumn, Entity } from 'typeorm';
import { Product } from './product.entity';

@Entity({
    name: 'customer_product_wishlist',
})
export class CustomerProductWishList extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'int' })
    productId: number;

    @Column({ nullable: false, type: 'int' })
    customerId: number;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    products?: Product[];
}
