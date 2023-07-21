import { JwtService } from '@nestjs/jwt';
import { ProductSqlService } from '../services/product.sql.service';
import { ProductAppController } from './product.app.controller';
import { TestingModule, Test } from '@nestjs/testing';
import { ProductFeedbackSqlService } from '../services/product.feedback.sql.service';
import { ConfigService } from '@nestjs/config';
import { I18nModule } from '@/common/services/i18n.service';
import { I18nService } from 'nestjs-i18n';

describe('ProductAppController', () => {
    let controller: ProductAppController;
    const mockProductSqlService = {},
        mockProductFeedbackSqlService = {};
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductAppController],
            providers: [
                ProductSqlService,
                JwtService,
                ProductFeedbackSqlService,
                ConfigService,
            ],
            imports: [I18nModule],
        })
            .overrideProvider(ProductFeedbackSqlService)
            .useValue(mockProductFeedbackSqlService)
            .overrideProvider(ProductSqlService)
            .useValue(mockProductSqlService)
            .compile();

        controller = module.get<ProductAppController>(ProductAppController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
