import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ErrorResponse, SuccessResponse } from '@/common/helpers/response';
import { JoiValidationPipe } from '@/common/pipe/joi.validation.pipe';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';
import {
    categoryListQuerySchema,
    createCategorySchema,
    updateCategorySchema,
} from '../category.validator';
import {
    ICategoryListQuery,
    ICreateCategoryDTO,
    IUpdateCategoryDTO,
} from '../category.interface';
import { createWinstonLogger } from '@/common/services/winston.service';
import { MODULE_NAME } from '../category.constant';
import { CategoryCmsSqlService } from '../services/category.cms.sql.service';
import { HttpStatus } from '@/common/constants';
import { idSchema } from '@/modules/common/common.validator';
import { UserRole } from '@/modules/user/user.constant';
import { Roles } from '@/common/helpers/commonFunctions';

// TODO require admin
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('/cms/category')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class CategoryCmsController {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
        private readonly categoryCmsService: CategoryCmsSqlService,
    ) {
        //
    }

    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    @Post('/')
    async createCategory(
        @Body(new JoiValidationPipe(createCategorySchema))
        body: ICreateCategoryDTO,
        @Req() req,
    ) {
        try {
            const categoryNameExists =
                await this.categoryCmsService.checkCategoryExistByName(
                    body.name,
                );

            if (categoryNameExists) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                            key: 'name',
                            message: this.i18n.t('category.nameExist'),
                        },
                    ],
                );
            }
            body.createdBy = req.loginUser.id;
            const createdCategoryId =
                await this.categoryCmsService.createCategory(body);
            return new SuccessResponse({ id: createdCategoryId });
        } catch (error) {
            this.logger.error(`Error in createCategory API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Patch('/:id')
    async updateCategory(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        id: number,
        @Body(new JoiValidationPipe(updateCategorySchema))
        body: IUpdateCategoryDTO,
        @Req() req,
    ) {
        try {
            const categoryExist =
                await this.categoryCmsService.checkCategoryExistById(id);

            if (!categoryExist) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('errors.444'),
                );
            }

            const categoryNameExists =
                await this.categoryCmsService.checkCategoryExistByName(
                    body.name,
                    id,
                );

            if (categoryNameExists) {
                return new ErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    this.i18n.t('errors.400'),
                    [
                        {
                            errorCode: HttpStatus.ITEM_ALREADY_EXIST,
                            key: 'name',
                            message: this.i18n.t('category.nameExist'),
                        },
                    ],
                );
            }
            body.updatedBy = req.loginUser.id;
            const category = await this.categoryCmsService.updateCategory(
                id,
                body,
            );
            return new SuccessResponse(category);
        } catch (error) {
            this.logger.error(`Error in updateCategory API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }

    @Delete('/:id')
    async deleteCategory(
        @Param('id', new JoiValidationPipe(idSchema), new ParseIntPipe())
        id: number,
        @Req() req,
    ) {
        try {
            const categoryExist =
                await this.categoryCmsService.checkCategoryExistById(id);

            if (!categoryExist) {
                return new ErrorResponse(
                    HttpStatus.ITEM_NOT_FOUND,
                    this.i18n.t('errors.444'),
                );
            }
            const category = await this.categoryCmsService.deleteCategoryById(
                id,
                req.loginUser.id,
            );
            return new SuccessResponse({ id });
        } catch (error) {
            this.logger.error(`Error in deleteCategory API, ${error}`);
            return new InternalServerErrorException(error);
        }
    }
}
