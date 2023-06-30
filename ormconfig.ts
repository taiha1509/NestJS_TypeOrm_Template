import { UserToken } from '@/mysql-entity/user-token.entity';
import { User } from '@/mysql-entity/user.entity';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

// ormconfig.ts
export const config: TypeOrmModuleOptions = {
    migrations: ['src/migration/*{.ts,.js}'],
    synchronize: true,
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME,
    entities: [User, UserToken], // maybe you should also consider chage it to something like:  [__dirname + '/**/*.entity.ts', __dirname + '/src/**/*.entity.js']
};

TypeOrmModule.forRoot(config);
