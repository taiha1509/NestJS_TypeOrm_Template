import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { baseColumnConfig } from '../constants';

export class CreateFileTable1688612261702 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'files',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'originalName',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'key',
                        type: 'varchar(2000)',
                        isNullable: false,
                    },
                    {
                        name: 'mimeType',
                        type: 'varchar(255)',
                        isNullable: false,
                    },
                    {
                        name: 'size',
                        type: 'int',
                        isNullable: false,
                    },
                    ...baseColumnConfig,
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('files', true);
    }
}
