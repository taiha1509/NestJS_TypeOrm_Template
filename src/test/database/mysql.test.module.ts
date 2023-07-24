import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { testDatabaseConfig } from './config';
dotenv.config();

const {
    MYSQL_CONNECTION_LIMIT,
    MYSQL_CONNECTION_RATE_LIMIT,
    MYSQL_DATABASE_NAME,
    MYSQL_DEBUG_MODE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_USER,
} = testDatabaseConfig;

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    type: 'mysql',
                    host: MYSQL_HOST,
                    port: +MYSQL_PORT,
                    username: MYSQL_USER,
                    password: MYSQL_PASSWORD,
                    database: MYSQL_DATABASE_NAME,
                    // synchronize: true,
                    entities: [__dirname + '/../../mysql-entity/*{.js,.ts}'],
                    logging: !!(+MYSQL_DEBUG_MODE || 0),
                };
            },
        }),
    ],
    providers: [],
})
export class MySqlTestModule {}
