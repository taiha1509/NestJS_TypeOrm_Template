import { User } from '../../mysql-entity/user.entity';
import { hashSync } from 'bcrypt';
import { In, MigrationInterface, QueryRunner, Table } from 'typeorm';
import { UserStatus } from '../../modules/user/user.constant';

const users = [
    {
        name: 'hant',
        email: 'hant@tokyotechlab.com',
        password: hashSync('Abc@1234', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: UserStatus.ACTIVE,
    },
];

export class User1685596635800 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.connection
            .getRepository(User)
            .createQueryBuilder('user')
            .insert()
            .into(User)
            .values([...users])
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const userRepo = await queryRunner.connection.getRepository('users');
        const response = await userRepo.delete({
            email: In(users.map((user) => user.email)),
        });
    }
}
