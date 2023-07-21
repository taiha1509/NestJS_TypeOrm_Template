import { AppModule } from '@/app.module';
import { ProductAppController } from './product.app.controller';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
describe('ProductAppController', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    it('/ping (GET)', () => {
        return request(app.getHttpServer())
            .get('http://localhost:3000/api/v1/ping')
            .expect('pong');
    });
});
