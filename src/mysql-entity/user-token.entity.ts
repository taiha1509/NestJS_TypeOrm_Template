import { UserTokenType } from '../modules/auth/auth.constant';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MysqlBaseEntity } from './base.entity';

@Entity({
    name: 'user_tokens',
})
export class UserToken extends MysqlBaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    userId: number;

    @Column({ nullable: false, type: 'varchar' })
    token: string;

    @Column({ nullable: false, type: 'varchar' })
    hashToken: string;

    @Column({
        nullable: false,
        type: 'enum',
        enum: Object.values(UserTokenType),
    })
    type: UserTokenType;

    @Column({ default: null, nullable: true, type: Date })
    deletedAt?: Date;
}
