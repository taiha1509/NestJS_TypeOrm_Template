import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME,
    // synchronize: true,
    entities: ['**/*.entity.ts'],
    migrations: [
        'src/database/migrations/*.ts',
        'src/database/seeds/*{.ts,.js}',
    ],
});
