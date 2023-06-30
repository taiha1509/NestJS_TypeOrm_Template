import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MysqlBaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @CreateDateColumn({ default: new Date(), type: Date })
    createdAt: Date;

    @UpdateDateColumn({ default: new Date(), type: Date })
    updatedAt: Date;

    @Column({ default: null, type: 'int' })
    deletedBy?: number;

    @Column({ default: null, type: 'int' })
    updatedBy: number;

    @Column({ type: 'int' })
    createdBy: number;
}
