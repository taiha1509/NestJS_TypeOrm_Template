import { MysqlBaseEntity } from './base.entity';
import { Column, DeleteDateColumn, Entity } from 'typeorm';

@Entity({
    name: 'order_products',
})
export class OrderProduct extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'int' })
    productId: number;

    @Column({ nullable: true, type: 'int' })
    orderId: number;

    @Column({ nullable: false, type: 'int' })
    quantity: number;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;
}
