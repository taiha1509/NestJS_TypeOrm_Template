import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/mysql-entity/product.entity';
import { Category } from '@/mysql-entity/category.entity';
import { ProductCategory } from '@/mysql-entity/product-category';
import { ProductAppController } from './controllers/product.app.controller';
import { ProductSqlService } from './services/product.sql.service';
import { ProductFeedback } from '@/mysql-entity/product-feedback.entity';
import { ProductFeedbackSqlService } from './services/product.feedback.sql.service';
import { CustomerCart } from '@/mysql-entity/customer-cart.entity';
import { ProductCmsController } from './controllers/product.cms.controller';
import { ProductCmsSqlService } from './services/product.cms.sql.service';
import { CustomerProductWishList } from '@/mysql-entity/customer-product-wishlist';
import { File } from '@/mysql-entity/file.entity';
import { ProductFile } from '@/mysql-entity/product-file.entity';
import { User } from '@/mysql-entity/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Product,
            Category,
            ProductCategory,
            ProductFeedback,
            CustomerCart,
            CustomerProductWishList,
            File,
            ProductFile,
            User,
        ]),
    ],
    controllers: [ProductAppController, ProductCmsController],
    providers: [
        ProductSqlService,
        JwtService,
        ProductFeedbackSqlService,
        ProductCmsSqlService,
    ],
    exports: [ProductSqlService],
})
export class ProductModule {
    //
}
