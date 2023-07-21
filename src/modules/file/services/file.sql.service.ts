import ConfigKey from '@/common/config/config-key';
import { createWinstonLogger } from '@/common/services/winston.service';
import { File } from '@/mysql-entity/file.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import AWS from 'aws-sdk';
import { Repository } from 'typeorm';
import { MODULE_NAME, presignedURLExpiresIn } from '../file.constant';
import { AWSS3Service } from './s3.aws.service';
import { IRegisterFile } from '../file.interface';
import dayjs from 'dayjs';

@Injectable()
export class FileSqlService {
    constructor(
        private readonly configService: ConfigService,
        private readonly awsS3Service: AWSS3Service,
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
    ) {}

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async insertFile(data: IRegisterFile) {
        try {
            const keyChunk = data.key?.split('/');
            const insertResult = await this.fileRepository.insert({
                originalName: data.originalName,
                createdBy: data.createdBy,
                mimeType: data.mimeType,
                size: data.size,
                name: keyChunk[keyChunk.length - 1],
                key: data.key,
            });

            return insertResult?.identifiers?.[0]?.id as number;
        } catch (error) {
            this.logger.error(`Error in insertFile service ${error}`);
            throw error;
        }
    }

    async deleteFile(id: number, deletedBy: number) {
        try {
            const dateNow = new Date();
            await this.fileRepository.update(
                {
                    id,
                },
                {
                    deletedAt: dateNow,
                    updatedAt: dateNow,
                    deletedBy,
                    updatedBy: deletedBy,
                },
            );
            return id;
        } catch (error) {
            this.logger.error(`Error in deleteFile service ${error}`);
            throw error;
        }
    }

    async checkFileExistById(id: number) {
        try {
            return await this.fileRepository.exist({ where: { id } });
        } catch (error) {
            this.logger.error(`Error in checkFileExistById service ${error}`);
            throw error;
        }
    }
}
