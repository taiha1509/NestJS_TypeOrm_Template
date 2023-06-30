import { MysqlBaseEntity } from './base.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({
    name: 'customer_cart_items',
})
export class CustomerCartItem extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'int' })
    cartId: number;

    @Column({ nullable: true, type: 'int' })
    productId: number;

    @Column({ nullable: false, type: 'int' })
    quantity: number;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    @OneToOne(() => Product, (product) => product.cartItem)
    @JoinColumn({
        referencedColumnName: 'id',
        name: 'productId',
    })
    product: Product;
}
