import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UserSqlService } from './services/user.sql.service';
import { UserAppController } from './controllers/user.app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../mysql-entity/user.entity';
import { AuthSqlService } from '../auth/services/auth.sql.service';
import { AuthLoginService } from '../auth/services/auth.login.service';
import { UserOTP } from '@/mysql-entity/user-otp.entity';
import { UserToken } from '@/mysql-entity/user-token.entity';
import { Product } from '@/mysql-entity/product.entity';
import { AuthGoogleService } from '../auth/services/auth.google.service';
import { SendGridService } from '../common/services/sendgrid.service';
import { UserCmsController } from './controllers/user.cms.controller';
import { UserCmsSqlService } from './services/user.cms.sql.service';
import { File } from '@/mysql-entity/file.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserOTP, UserToken, Product, File]),
    ],
    controllers: [UserAppController, UserCmsController],
    providers: [
        UserSqlService,
        JwtService,
        AuthSqlService,
        AuthLoginService,
        AuthGoogleService,
        SendGridService,
        UserCmsSqlService,
    ],
    exports: [UserSqlService],
})
export class UserModule {
    //
}
