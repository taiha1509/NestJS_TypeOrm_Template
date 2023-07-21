import { MysqlBaseEntity } from './base.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductImageType } from '../modules/product/product.constant';
import { File } from './file.entity';

@Entity({
    name: 'product_files',
})
export class ProductFile extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'int' })
    productId: number;

    @Column({ nullable: false, type: 'int' })
    fileId: number;

    @Column({ nullable: false, type: 'int' })
    order: number;

    @Column({ nullable: false, type: 'int' })
    type: ProductImageType;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    @OneToOne(() => File, (pf) => pf.productFile)
    @JoinColumn()
    image: File;
}
