import { JwtService } from '@nestjs/jwt';
import { ProductSqlService } from '../../../modules/product/services/product.sql.service';
import { ProductAppController } from '../../../modules/product/controllers/product.app.controller';
import { TestingModule, Test } from '@nestjs/testing';
import { ProductFeedbackSqlService } from '../../../modules/product/services/product.feedback.sql.service';
import { ConfigService } from '@nestjs/config';
import { I18nModule } from '@/common/services/i18n.service';
import { I18nService } from 'nestjs-i18n';

describe('ProductAppController', () => {
    let controller: ProductAppController;
    const mockProductSqlService = {
            getProductById: jest.fn().mockImplementation((dto) => ({
                id: Date.now(),
                ...dto,
            })),
        },
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

    it('should get product details and return correct data', async () => {
        expect(mockProductSqlService.getProductById(1)).toEqual({
            id: expect.any(Number),
        });
    });
});
