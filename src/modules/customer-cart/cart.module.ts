import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/mysql-entity/product.entity';
import { CustomerCartItem } from '@/mysql-entity/customer-cart-item.entity';
import { CustomerCart } from '@/mysql-entity/customer-cart.entity';
import { CartAppController } from './cart.app.controller';
import { CartSqlService } from './services/cart.sql.service';
import { ProductSqlService } from '../product/services/product.sql.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([CustomerCartItem, CustomerCart, Product]),
    ],
    controllers: [CartAppController],
    providers: [CartSqlService, JwtService, ProductSqlService],
    exports: [],
})
export class CartModule {
    //
}
