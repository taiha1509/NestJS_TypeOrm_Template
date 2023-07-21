import { MysqlBaseEntity } from './base.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
} from 'typeorm';
import {
    CustomerOrderStatus,
    PaymentMethod,
} from '../modules/order/order.constant';
import {
    IBankingPaymentDetail,
    ICreditDebitPaymentDetail,
} from '../modules/order/order.interface';
import { Product } from './product.entity';

@Entity({
    name: 'customer_orders',
})
export class CustomerOrder extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'varchar' })
    phoneNumber: string;

    @Column({ nullable: false, type: 'varchar' })
    customerName: string;

    @Column({ nullable: false, type: 'varchar' })
    code: string;

    @Column({ nullable: true, type: 'int' })
    customerId: number;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    @Column({ nullable: false, type: 'varchar' })
    address: string;

    @Column({ nullable: false, type: 'varchar' })
    province: string;

    @Column({ nullable: false, type: 'varchar' })
    district: string;

    @Column({ nullable: false, type: 'varchar' })
    ward: string;

    @Column({ nullable: false, type: 'varchar' })
    note: string;

    @Column({
        nullable: false,
        type: 'enum',
        enum: Object.values(PaymentMethod),
    })
    paymentMethod: PaymentMethod;

    @Column({ nullable: false, type: 'json', default: null })
    get paymentDetail():
        | IBankingPaymentDetail
        | ICreditDebitPaymentDetail
        | null {
        if (!this._paymentDetail) {
            return null;
        }
        return JSON.parse(this._paymentDetail);
    }

    set paymentDetail(
        value: IBankingPaymentDetail | ICreditDebitPaymentDetail | null,
    ) {
        if (!value) this._paymentDetail = null;
        else this._paymentDetail = JSON.stringify(value);
    }
    private _paymentDetail: string | null;

    @Column({ nullable: false, type: 'int' })
    shippingFee: number;

    @Column({
        nullable: false,
        type: 'enum',
        enum: Object.values(CustomerOrderStatus),
    })
    status: CustomerOrderStatus;

    @Column()
    isPaid: boolean;

    private _items: string | null;
    @Column({
        nullable: true,
        type: 'json',
        name: 'items',
        comment: 'Product list information in this order',
    })
    get items(): Product[] | null {
        if (typeof this._items == 'string' || !!this._items) {
            return JSON.parse(this._items);
        }
        return null;
    }

    set items(value: Product[] | null) {
        if (!value) this._items = null;
        else this._items = JSON.stringify(value);
    }

    @ManyToMany(() => Product, (p) => p.orders)
    @JoinTable()
    products: Product[];
}
