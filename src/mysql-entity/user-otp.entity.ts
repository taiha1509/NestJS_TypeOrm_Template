import { MysqlBaseEntity } from './base.entity';
import { Column, Entity } from 'typeorm';
import { UserOTPType } from '../modules/auth/auth.constant';

@Entity({
    name: 'user_otps',
})
export class UserOTP extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'int' })
    userId: number;

    @Column({ nullable: false, type: 'timestamp' })
    expiredAt: Date;

    @Column({ nullable: false, type: 'varchar' })
    value: string;

    @Column({
        default: UserOTPType.RESET_PASSWORD,
        type: 'enum',
        enum: Object.values(UserOTPType),
    })
    type: UserOTPType;

    @Column({ default: false, type: 'boolean' })
    isVerified: boolean;

    @Column({ default: null, type: Date })
    deletedAt?: Date;
}
