import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSqlService } from '../user/services/user.sql.service';
import { User } from '../../mysql-entity/user.entity';
import { CommonAppController } from './controllers/common.app.controller';
import { CategorySqlService } from '../category/services/category.sql.service';
import { Category } from '@/mysql-entity/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Category])],
    controllers: [CommonAppController],
    providers: [UserSqlService, JwtService, CategorySqlService],
    exports: [],
})
export class CommonModule {
    //
}
