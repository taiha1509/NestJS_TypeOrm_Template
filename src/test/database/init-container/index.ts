import { MySqlContainer, StartedMySqlContainer } from 'testcontainers';
import { testDatabaseConfig } from '../config';

export class TestDatabaseInitialization {
    container: StartedMySqlContainer;
    async init() {
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
        console.log('MySQL database container is initializing');
        this.container = await new MySqlContainer()
            .withUsername(MYSQL_USER)
            .withUserPassword(MYSQL_PASSWORD)
            .withDatabase(MYSQL_DATABASE_NAME)
            .start();
        testDatabaseConfig.MYSQL_PORT = this.container.getPort();
        testDatabaseConfig.MYSQL_HOST = this.container.getHost();

        console.log(
            'MySQL database container initialized',
            this.container.getHost(),
            this.container.getPort(),
            testDatabaseConfig,
        );
    }

    async release() {
        await this.container?.stop();
    }
}
