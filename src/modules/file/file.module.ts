import { File } from '@/mysql-entity/file.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { FileSqlService } from './services/file.sql.service';
import { AWSS3Service } from './services/s3.aws.service';
@Module({
    imports: [TypeOrmModule.forFeature([File])],
    controllers: [FileController],
    providers: [AWSS3Service, FileSqlService],
    exports: [],
})
export class FileModule {
    //
}
