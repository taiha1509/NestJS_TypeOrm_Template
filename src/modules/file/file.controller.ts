import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Post,
    Param,
    Delete,
    Patch,
    Query,
    UseGuards,
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ErrorResponse, SuccessResponse } from '@/common/helpers/response';
import { JoiValidationPipe } from '@/common/pipe/joi.validation.pipe';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import { idSchema } from '@/modules/common/common.validator';
import { createWinstonLogger } from '@/common/services/winston.service';
import { MODULE_NAME } from './file.constant';
import { IGetPresignedPutURLQuery, IRegisterFile } from './file.interface';
import {
    getPresignedPutURLQuerySchema,
    registerFileSchema,
} from './file.validator';
import { AWSS3Service } from './services/s3.aws.service';
import { FileSqlService } from './services/file.sql.service';
import ConfigKey from '@/common/config/config-key';
import { HttpStatus } from '@/common/constants';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('/file')
export class FileController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly awsS3Service: AWSS3Service,
        private readonly fileSqlService: FileSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Post('/register')
    async registerFile(
        @Body(new JoiValidationPipe(registerFileSchema))
        body: IRegisterFile,
        @Req() req,
    ) {
        try {
            body.createdBy = req.loginUser.id;
            // check if file in s3 exists
            const s3FileExist = await this.awsS3Service.checkObjectExistByKey(
                `s3://${this.configService.get(ConfigKey.AWS_S3_BUCKET)}/${
                    body.key
                }`,
            );

            if (!s3FileExist) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            key: 'key',
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            message: this.i18n.t('file.fileNotFound'),
                        },
                    ],
                );
            }

            const fileId = await this.fileSqlService.insertFile(body);

            return new SuccessResponse({ id: fileId });
        } catch (error) {
            this.logger.error(`Error in registerFile API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Post('/presigned-url')
    async generatePresignedUrl(
        @Query(new JoiValidationPipe(getPresignedPutURLQuerySchema))
        query: IGetPresignedPutURLQuery,
        @Req() req,
    ) {
        try {
            const presignedURL =
                await this.awsS3Service.generatePresignedPutObjectURL(
                    query.name,
                );

            return new SuccessResponse({ presignedPutURL: presignedURL });
        } catch (error) {
            this.logger.error(`Error in generatePresignedUrl API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Delete('/:id')
    async deleteFile(
        @Param('id', new JoiValidationPipe(idSchema))
        id: number,
        @Req() req,
    ) {
        try {
            // TODO check role to decide allow to reject delete action
            const fileExist = await this.fileSqlService.checkFileExistById(id);
            if (!fileExist) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            key: 'key',
                            errorCode: HttpStatus.ITEM_NOT_FOUND,
                            message: this.i18n.t('file.fileNotFound'),
                        },
                    ],
                );
            }
            await this.fileSqlService.deleteFile(id, req.loginUser.id);
            return new SuccessResponse({ id });
        } catch (error) {
            this.logger.error(`Error in getPresignedPutURL API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
