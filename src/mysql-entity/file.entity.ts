import { MysqlBaseEntity } from './base.entity';
import {
    AfterLoad,
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import ConfigKey from '../common/config/config-key';
import { ProductFile } from './product-file.entity';
import { User } from './user.entity';

const s3Url = `https://${process.env[ConfigKey.AWS_S3_BUCKET]}.s3.${
    process.env[ConfigKey.AWS_REGION]
}.amazonaws.com`;
@Entity({
    name: 'files',
})
export class File extends MysqlBaseEntity {
    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: false, type: 'varchar' })
    originalName: string;

    @Column({ nullable: false, type: 'varchar' })
    key: string;

    @Column({ nullable: false, type: 'varchar' })
    mimeType: string;

    @Column({ nullable: false, type: 'int' })
    size: number;

    @DeleteDateColumn({ default: null, type: Date })
    deletedAt?: Date;

    @ManyToMany(() => Product, (p) => p.images)
    products?: Product[];

    @OneToOne(() => ProductFile, (pf) => pf.image)
    productFile: ProductFile;

    @OneToOne(() => User, (user) => user.avatar)
    @JoinColumn()
    user?: User;

    protected url: string;
    @AfterLoad()
    getUrl() {
        this.url = `${s3Url}/${this.key}`;
    }
}
