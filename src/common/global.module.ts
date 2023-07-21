import { File } from '@/mysql-entity/file.entity';
import { User } from '@/mysql-entity/user.entity';
import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User, File])],
    providers: [JwtService],
    exports: [JwtService],
})
export class GlobalModule {}
