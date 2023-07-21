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
import { FindOptionsSelect, In, Like, Repository } from 'typeorm';
import {
    MODULE_NAME,
    userDetailAttributes,
    userListAttributes,
    userProfileAttributes,
    UserRole,
} from '../user.constant';
import { User } from '../../../mysql-entity/user.entity';
import {
    ICreateAdminUserDTO,
    IUpdateAdminUserDTO,
    IUpdateCustomerDTO,
    IUpdateUserProfileDTO,
    IUserCreateBody,
    IUserListQuery,
    IUserUpdateBody,
} from '../user.interface';
import { File } from '@/mysql-entity/file.entity';

@Injectable()
export class UserCmsSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    async getUserList(query: IUserListQuery, attributes = userListAttributes) {
        try {
            const {
                page = +DEFAULT_FIRST_PAGE,
                limit = +DEFAULT_LIMIT_FOR_PAGINATION,
                keyword = '',
                orderBy = DEFAULT_ORDER_BY,
                orderDirection = DEFAULT_ORDER_DIRECTION,
                roles = null,
            } = query;

            const [items, totalItems] = await this.userRepository
                .createQueryBuilder('u')
                .where((qb) => {
                    if (keyword) {
                        const keywordParam = `%${keyword}%`;
                        qb.where('u.name LIKE :keywordParam').orWhere(
                            'u.email LIKE :keywordParam',
                            { keywordParam },
                        );
                    }
                    if (roles && roles?.length) {
                        qb.andWhere('u.role IN (:roles)', { roles });
                    }
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .orderBy({
                    [orderBy]: orderDirection,
                })
                .select(attributes.map((a) => `u.${a}`))
                .getManyAndCount();

            return {
                items,
                totalItems,
            };
        } catch (error) {
            this.logger.error('Error in getUserList service', error);
            throw error;
        }
    }

    async getUserDetail(id: number, attributes = userDetailAttributes) {
        try {
            return await this.userRepository.findOne({
                where: { id },
                select: attributes as FindOptionsSelect<User>,
            });
        } catch (error) {
            this.logger.error('Error in getUserDetail service', error);
            throw error;
        }
    }

    async checkCustomerExistByIdAndRole(id: number, roles: UserRole[]) {
        try {
            return await this.userRepository.exist({
                where: {
                    id,
                    role: In(roles),
                },
            });
        } catch (error) {
            this.logger.error(
                'Error in checkCustomerExistByIdAndRole service',
                error,
            );
            throw error;
        }
    }

    async getUserById(id: number, attributes = userDetailAttributes) {
        try {
            return await this.userRepository.findOne({
                where: { id },
                select: attributes as FindOptionsSelect<User>,
            });
        } catch (error) {
            this.logger.error('Error in getUserById service', error);
            throw error;
        }
    }

    async updateCustomer(id: number, data: IUpdateCustomerDTO) {
        try {
            await this.userRepository.update(
                { id },
                {
                    ...data,
                },
            );
            return await this.getUserById(id);
        } catch (error) {
            this.logger.error('Error in updateCustomer service', error);
            throw error;
        }
    }

    async updateAdminUser(id: number, data: IUpdateAdminUserDTO) {
        try {
            await this.userRepository.update(
                { id },
                {
                    ...data,
                },
            );
            return await this.getUserById(id);
        } catch (error) {
            this.logger.error('Error in updateAdminUser service', error);
            throw error;
        }
    }

    async deleteUserById(id: number, deletedBy: number) {
        try {
            await this.userRepository.update(
                { id },
                {
                    deletedAt: new Date(),
                    deletedBy,
                },
            );
            return id;
        } catch (error) {
            this.logger.error('Error in deleteUserById service', error);
            throw error;
        }
    }

    async checkFileExist(id: number) {
        try {
            return await this.fileRepository.exist({ where: { id } });
        } catch (error) {
            this.logger.error('Error in checkFileExist service', error);
            throw error;
        }
    }

    async checkUserExistByEmail(email: string) {
        try {
            return await this.userRepository.exist({ where: { email } });
        } catch (error) {
            this.logger.error('Error in checkUserExistByEmail service', error);
            throw error;
        }
    }

    async createAdminUser(data: ICreateAdminUserDTO) {
        try {
            const insertResult = await this.userRepository.insert({
                ...data,
            });

            return insertResult.identifiers?.[0]?.id;
        } catch (error) {
            this.logger.error('Error in createAdminUser service', error);
            throw error;
        }
    }
}
