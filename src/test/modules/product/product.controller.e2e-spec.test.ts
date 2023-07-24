import { AppModule } from '@/app.module';
import { ProductAppController } from '../../../modules/product/controllers/product.app.controller';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppInitialization } from '@/test/initialization/app';

export class ProductAppControllerE2E {
    async run() {
        describe('ProductAppController', () => {
            // it('/ping (GET)', () => {
            //     return request(app.getHttpServer())
            //         .get('http://localhost:3000/api/v1/ping', (err, response) => {
            //             console.log('err', err);
            //             console.log('response', response);
            //         })
            //         .expect('pong');
            // });
            console.log('test ProductAppController');

            it('app should be defined', () => {
                expect(AppInitialization.app).toBeDefined();
            });
        });
    }
}
