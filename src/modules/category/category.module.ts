import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/mysql-entity/product.entity';
import { Category } from '@/mysql-entity/category.entity';
import { ProductCategory } from '@/mysql-entity/product-category';
import { CategoryAppController } from './controllers/category.app.controller';
import { CategorySqlService } from './services/category.sql.service';
import { CategoryCmsController } from './controllers/category.cms.controller';
import { CategoryCmsSqlService } from './services/category.cms.sql.service';

@Module({
    imports: [TypeOrmModule.forFeature([Product, Category, ProductCategory])],
    controllers: [CategoryAppController, CategoryCmsController],
    providers: [CategorySqlService, JwtService, CategoryCmsSqlService],
    exports: [CategorySqlService, CategoryCmsSqlService],
})
export class CategoryModule {
    //
}
