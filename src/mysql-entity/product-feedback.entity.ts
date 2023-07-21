import { MysqlBaseEntity } from './base.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';
@Entity({
    name: 'product_feedbacks',
})
export class ProductFeedback extends MysqlBaseEntity {
    @Column()
    rating: number;

    @Column({ nullable: false, type: 'varchar' })
    comment: string;

    @Column({ nullable: false, type: 'int' })
    customerId: number;

    @Column({ nullable: false, type: 'int' })
    productId: number;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    @ManyToOne(() => Product, (p) => p.feedbacks)
    @JoinColumn()
    product: Product;

    @OneToOne(() => User, (u) => u.productFeedback)
    user: User;
}
