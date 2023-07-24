import { AppModule } from '@/app.module';
import { TestingModule, Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MySqlTestModule } from '../database/mysql.test.module';
import { StartedMySqlContainer } from 'testcontainers';

export class AppInitialization {
    static app: INestApplication;
    container: StartedMySqlContainer;
    constructor(container: StartedMySqlContainer) {
        this.container = container;
    }

    static async init() {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule, MySqlTestModule],
        }).compile();

        AppInitialization.app = module.createNestApplication();
        await AppInitialization.app.init();
    }
}
