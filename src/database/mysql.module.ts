import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ConfigKey from '../common/config/config-key';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    type: 'mysql',
                    host: configService.get(ConfigKey.MYSQL_HOST),
                    port: +configService.get(ConfigKey.MYSQL_PORT),
                    username: configService.get(ConfigKey.MYSQL_USER),
                    password: configService.get(ConfigKey.MYSQL_PASSWORD),
                    database: configService.get(ConfigKey.MYSQL_DATABASE_NAME),
                    // synchronize: true,
                    entities: [__dirname + '/../mysql-entity/*{.js,.ts}'],
                    logging: !!(
                        +configService.get(ConfigKey.MYSQL_DEBUG_MODE) || 0
                    ),
                };
            },
        }),
    ],
    providers: [],
})
export class MySqlModule {}
