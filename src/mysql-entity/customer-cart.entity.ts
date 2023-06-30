import { MysqlBaseEntity } from './base.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity({
    name: 'customer_carts',
})
export class CustomerCart extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'int' })
    customerId: number;

    @Column({ nullable: true, type: 'int' })
    shippingFee: number;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    @ManyToMany(() => Product, (p) => p.carts)
    @JoinTable()
    products: Product[];

    @OneToOne(() => User, (user) => user.id)
    @JoinColumn({
        referencedColumnName: 'id',
        name: 'customerId',
    })
    user: User;
}
