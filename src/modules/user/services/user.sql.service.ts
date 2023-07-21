import { Injectable, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
} from '@/common/constants';
import { createWinstonLogger } from '@/common/services/winston.service';
import { FindOptions, FindOptionsSelect, In, Like, Repository } from 'typeorm';
import {
    MODULE_NAME,
    userListAttributes,
    userProfileAttributes,
} from '../user.constant';
import { User } from '../../../mysql-entity/user.entity';
import {
    IUpdateUserProfileDTO,
    IUserCreateBody,
    IUserListQuery,
    IUserUpdateBody,
} from '../user.interface';

@Injectable()
export class UserSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getUserByField(
        field: string,
        value: any,
        userAttributes = userListAttributes,
    ) {
        try {
            const user = await this.userRepository.findOne({
                where: {
                    [field]: value,
                },
                select: userAttributes as FindOptionsSelect<User>,
            });
            return user;
        } catch (error) {
            this.logger.error('Error in getUserByField service', error);
            throw error;
        }
    }

    async getUserById(
        id: number,
        userAttributes = userListAttributes,
    ): Promise<User> {
        try {
            const user = await this.userRepository.findOne({
                where: {
                    id,
                },
                select: userAttributes as FindOptionsSelect<User>,
            });
            return user;
        } catch (error) {
            this.logger.error('Error in getUserById service', error);
            throw error;
        }
    }

    async getAllUsers(userAttributes: string[]) {
        try {
            const users = await this.userRepository.find();
            return users;
        } catch (error) {
            this.logger.error('Error in getAllUser service', error);
            throw error;
        }
    }

    async updateUser(
        id: number,
        user: IUserUpdateBody,
        attributes = userListAttributes,
    ): Promise<User> {
        try {
            await this.userRepository.update(
                { id },
                {
                    ...user,
                },
            );
            const updatedUser = await this.getUserById(id, attributes);
            return updatedUser;
        } catch (error) {
            this.logger.error('Error in updateUser service', error);
            throw error;
        }
    }

    async deleteUser(id: number, deletedBy: number) {
        try {
            const body = { deletedAt: new Date(), deletedBy: deletedBy };
            await this.userRepository.update({ id }, body);
        } catch (error) {
            this.logger.error('Error in deleteUser service', error);
            throw error;
        }
    }
}
