import { AppModule } from '@/app.module';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ProductSqlService } from '../../../modules/product/services/product.sql.service';
describe('Product Sql service', () => {
    let app: INestApplication;
    let service: ProductSqlService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        service = module.get<ProductSqlService>(ProductSqlService);
        // app = module.createNestApplication();
        // await app.init();
    });

    describe('checkProductExist', () => {
        it('negative id should return false', async () => {
            const productExist = await service.checkProductExistById(-1);
            expect(productExist).toBe(false);
        });
    });
});
