import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/mysql-entity/product.entity';
import { CustomerCartItem } from '@/mysql-entity/customer-cart-item.entity';
import { CustomerCart } from '@/mysql-entity/customer-cart.entity';
import { CartAppController } from './cart.app.controller';
import { CartSqlService } from './services/cart.sql.service';
import { ProductSqlService } from '../product/services/product.sql.service';
import { ProductFeedback } from '@/mysql-entity/product-feedback.entity';
import { CustomerProductWishList } from '@/mysql-entity/customer-product-wishlist';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CustomerCartItem,
            CustomerCart,
            Product,
            ProductFeedback,
            CustomerProductWishList,
        ]),
    ],
    controllers: [CartAppController],
    providers: [CartSqlService, JwtService, ProductSqlService],
    exports: [],
})
export class CartModule {
    //
}
