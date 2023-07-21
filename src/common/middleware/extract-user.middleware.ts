import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthorizationType } from '../constants';
import * as dotenv from 'dotenv';
import { extractToken } from '../helpers/commonFunctions';
import { JwtService } from '@nestjs/jwt';
import ConfigKey from '../config/config-key';
import { ConfigService } from '@nestjs/config';
dotenv.config();

@Injectable()
export class ExtractUserMiddleware implements NestMiddleware {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}
    use(req: Request, _res: Response, next: NextFunction) {
        if (req.headers.authorization) {
            const token = extractToken(req.headers.authorization || '');
            if (token) {
                (req as any).loginUser = this.validateToken(
                    token,
                    (req as any).authorizationType ===
                        AuthorizationType.REFRESH_TOKEN,
                );
            }
        }
        next();
    }

    validateToken(token: string, isRefreshToken = false) {
        try {
            if (isRefreshToken) {
                return this.jwtService.verify(token, {
                    secret: this.configService.get(
                        ConfigKey.JWT_REFRESH_TOKEN_SECRET_KEY,
                    ),
                    ignoreExpiration: false,
                });
            } else {
                return this.jwtService.verify(token, {
                    secret: this.configService.get(
                        ConfigKey.JWT_ACCESS_TOKEN_SECRET_KEY,
                    ),
                    ignoreExpiration: false,
                });
            }
        } catch (error) {
            return;
        }
    }
}
