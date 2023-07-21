import ConfigKey from '@/common/config/config-key';
import { createWinstonLogger } from '@/common/services/winston.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS from 'aws-sdk';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { MODULE_NAME, presignedURLExpiresIn } from '../file.constant';

@Injectable()
export class AWSS3Service {
    private s3: AWS.S3;
    private bucketName: string;
    constructor(private readonly configService: ConfigService) {
        AWS.config.update({
            region: this.configService.get(ConfigKey.AWS_REGION),
            accessKeyId: this.configService.get(ConfigKey.AWS_API_ACCESS_KEY),
            secretAccessKey: this.configService.get(
                ConfigKey.AWS_API_SECRET_ACCESS_KEY,
            ),
        });

        this.s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            signatureVersion: 'v4',
        });
        this.bucketName = this.configService.get(ConfigKey.AWS_S3_BUCKET);
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async checkObjectExistByKey(key: string) {
        try {
            const result = await new Promise(async (resolve, reject) => {
                await this.s3
                    .headObject({
                        Bucket: this.bucketName,
                        Key: key,
                    })
                    .promise()
                    .then(
                        (data) => {
                            resolve(data);
                        },
                        (reason) => {
                            reject(reason);
                        },
                    )
                    .catch((error) => {
                        reject(error);
                    });
            });

            return result;
        } catch (error) {
            this.logger.error(
                `Error in checkObjectExistByKey service ${error}`,
            );
            return false;
        }
    }

    async generatePresignedPutObjectURL(name: string) {
        try {
            const dateNow = dayjs();
            const fileName = `${uuidv4()}_${name}`;
            const key = `${dateNow.year()}/${
                dateNow.month() + 1
            }/${dateNow.date()}/${fileName}`;

            return await this.s3.getSignedUrlPromise('putObject', {
                Bucket: this.bucketName,
                Key: key,
                Expires: presignedURLExpiresIn,
            });
        } catch (error) {
            this.logger.error(
                `Error in generatePresignedPutObjectURL service ${error}`,
            );
            throw error;
        }
    }
}
