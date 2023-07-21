import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_LIMIT_FOR_PAGINATION,
} from '@/common/constants';
import { ICommonListQuery, IPaginationResult } from '@/common/interfaces';
import { productDetailAttributes } from '@/modules/product/product.constant';
import { userProfileAttributes } from '@/modules/user/user.constant';
import { Product } from '@/mysql-entity/product.entity';
import { CustomerProductWishList } from '@/mysql-entity/customer-product-wishlist';
import { UserToken } from '@/mysql-entity/user-token.entity';
import { User } from '@/mysql-entity/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcrypt';
import { createWinstonLogger } from 'src/common/services/winston.service';
import {
    DataSource,
    FindOptionsSelect,
    LessThanOrEqual,
    MoreThanOrEqual,
    Repository,
} from 'typeorm';
import { MODULE_NAME, UserOTPType } from '../auth.constant';
import { ICreateUserTokenBody } from '../auth.interface';
import { UserOTP } from '@/mysql-entity/user-otp.entity';
import { UserStatus } from '@/modules/user/user.constant';
import { File } from '@/mysql-entity/file.entity';
import { fileAttributes } from '@/modules/file/file.constant';

@Injectable()
export class AuthSqlService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(UserToken)
        private readonly userTokenRepository: Repository<UserToken>,
        private readonly dataSource: DataSource,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}
    private readonly logger = createWinstonLogger(
        MODULE_NAME,
        this.configService,
    );

    public async checkHashTokenExist(hashToken: string) {
        try {
            const isHashTokenExist = await this.userTokenRepository.exist({
                where: [
                    {
                        hashToken,
                        deletedAt: null,
                    },
                    {
                        hashToken,
                        deletedAt: MoreThanOrEqual(new Date()),
                    },
                ],
            });
            return isHashTokenExist;
        } catch (error) {
            this.logger.error('Error in checkHashTokenExist: ', error);
            throw error;
        }
    }

    public async createUserToken(token: ICreateUserTokenBody) {
        try {
            const tokenEntity = new UserToken();
            tokenEntity.hashToken = token.hashToken;
            tokenEntity.token = token.token;
            tokenEntity.type = token.type;
            tokenEntity.deletedAt = token.deletedAt;
            tokenEntity.userId = token.userId;
            tokenEntity.createdBy = token.createdBy;
            return await this.userTokenRepository.insert(tokenEntity);
        } catch (error) {
            this.logger.error('Error in createUserToken service', error);
            throw error;
        }
    }

    public async updatePassword(userId: number, password: string) {
        try {
            return await this.userRepository.update(
                {
                    id: userId,
                },
                {
                    password: hashSync(password, 10),
                },
            );
        } catch (error) {
            this.logger.error('Error in updatePassword service', error);
            throw error;
        }
    }

    public async activateUser(userId, otp: string) {
        const queryRunner = await this.dataSource.createQueryRunner();
        try {
            await queryRunner.startTransaction();
            const userOTPRepository =
                queryRunner.manager.getRepository(UserOTP);
            await queryRunner.manager.getRepository(User).update(
                {
                    id: userId,
                },
                { status: UserStatus.ACTIVE },
            );
            await userOTPRepository.update(
                {
                    userId,
                    value: otp,
                    type: UserOTPType.REGISTER_USER,
                },
                {
                    isVerified: true,
                },
            );
            await queryRunner.commitTransaction();

            return userId;
        } catch (error) {
            this.logger.error(`Error in activateUser service ${error}`);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            queryRunner.release();
        }
    }

    async getProductWishList(
        query: ICommonListQuery & { userId: number },
        attributes = productDetailAttributes,
    ): Promise<IPaginationResult<Product>> {
        try {
            const {
                userId,
                page = DEFAULT_FIRST_PAGE,
                limit = DEFAULT_LIMIT_FOR_PAGINATION,
            } = query;
            const [products, count] = await this.productRepository
                .createQueryBuilder('p')
                .leftJoinAndSelect(
                    CustomerProductWishList,
                    'cpw',
                    'cpw.productId = p.id',
                )
                .leftJoinAndSelect(User, 'u', 'u.id = cpw.customerId')
                .where('u.id = :userId', { userId })
                .select(attributes.map((attr) => `p.${attr}`))
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return {
                items: products,
                totalItems: count,
            };
        } catch (error) {
            this.logger.error('Error in getProductWishList service', error);
        }
    }

    async getUserProfile(
        id: number,
        userAttributes = userProfileAttributes,
    ): Promise<User> {
        try {
            return await this.userRepository
                .createQueryBuilder('u')
                .leftJoinAndMapOne('u.avatar', File, 'f', 'f.id = u.avatarId')
                .where('u.id = :userId', { userId: id })
                .select([
                    ...userAttributes.map((attr) => `u.${attr}`),
                    ...fileAttributes.map((attr) => `f.${attr}`),
                ])
                .getOne();
        } catch (error) {
            this.logger.error('Error in getUserProfile service', error);
            throw error;
        }
    }
}
