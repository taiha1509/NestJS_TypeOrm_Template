import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/mysql-entity/product.entity';
import { Category } from '@/mysql-entity/category.entity';
import { ProductCategory } from '@/mysql-entity/product-category';
import { ProductAppController } from './controllers/product.app.controller';
import { ProductSqlService } from './services/product.sql.service';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Category, ProductCategory])],
    controllers: [ProductAppController],
    providers: [ProductSqlService, JwtService],
    exports: [ProductSqlService],
})
export class ProductModule {
    //
}
