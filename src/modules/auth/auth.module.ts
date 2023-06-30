import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSqlService } from '../user/services/user.sql.service';
import { User } from '../../mysql-entity/user.entity';
import { AuthAppController } from './controllers/auth.app.controller';
import { AuthGoogleService } from './services/auth.google.service';
import { AuthLoginService } from './services/auth.login.service';

import { AuthSqlService } from './services/auth.sql.service';
import { UserToken } from '../../mysql-entity/user-token.entity';
import { SendGridService } from '../common/services/sendgrid.service';
import { UserOTP } from '@/mysql-entity/user-otp.entity';
import { Product } from '@/mysql-entity/product.entity';
import { CustomerProductWishList } from '@/mysql-entity/customer-product-wishlist';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            UserToken,
            UserOTP,
            Product,
            CustomerProductWishList,
        ]),
    ],
    controllers: [AuthAppController],
    providers: [
        JwtService,
        AuthSqlService,
        AuthGoogleService,
        AuthLoginService,
        UserSqlService,
        SendGridService,
    ],
})
export class AuthModule {
    //
}
