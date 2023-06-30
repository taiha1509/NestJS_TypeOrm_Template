import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../mysql-entity/user.entity';
import { AuthSqlService } from '../auth/services/auth.sql.service';
import { Product } from '@/mysql-entity/product.entity';
import { CustomerOrderAppController } from './controllers/order.app.controller';
import { CartSqlService } from '../customer-cart/services/cart.sql.service';
import { CustomerCart } from '@/mysql-entity/customer-cart.entity';
import { CustomerCartItem } from '@/mysql-entity/customer-cart-item.entity';
import { OrderSqlService } from './services/order.sql.service';
import { ProductSqlService } from '../product/services/product.sql.service';
import { CustomerOrder } from '@/mysql-entity/customer-order.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Product,
            CustomerCart,
            CustomerCartItem,
            Product,
            CustomerOrder,
        ]),
    ],
    controllers: [CustomerOrderAppController],
    providers: [JwtService, CartSqlService, OrderSqlService, ProductSqlService],
    exports: [],
})
export class OrderModule {
    //
}
