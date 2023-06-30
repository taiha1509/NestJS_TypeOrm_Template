import { MysqlBaseEntity } from './base.entity';
import { UserGender, UserStatus } from '../modules/user/user.constant';
import { Column, DeleteDateColumn, Entity, OneToOne } from 'typeorm';
import { CustomerCart } from './customer-cart.entity';

@Entity({
    name: 'users',
})
export class User extends MysqlBaseEntity {
    @Column()
    name: string;

    @Column({ nullable: false, type: 'varchar' })
    email: string;

    @Column({ nullable: false, type: 'varchar' })
    password: string;

    @Column({ default: new Date(), type: Date })
    createdAt: Date;

    @Column({ default: null, type: Date })
    birthday: Date;

    @Column({ default: null, type: 'varchar' })
    address: string;

    @Column({ default: null, type: 'enum', enum: Object.values(UserGender) })
    gender: UserGender;

    @Column({ default: null, type: 'varchar' })
    phoneNumber: string;

    @Column({ default: null, type: 'varchar' })
    description: Date;

    @Column({
        default: UserStatus.REGISTERING,
        type: 'enum',
        enum: Object.values(UserStatus),
    })
    status: UserStatus;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    @Column({ default: null, type: 'int' })
    avatarId: number;

    @OneToOne(() => CustomerCart, (cart) => cart.customerId)
    cart?: CustomerCart;
}
