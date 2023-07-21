import bcrypt from 'bcrypt';
import { DateFormat } from '../constants';
import dayjs from '../../plugins/dayjs';

import dotenv from 'dotenv';
import _pick from 'lodash/pick';
import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'aws-sdk/clients/workmail';
dotenv.config();

const DEFAULT_TIMEZONE_NAME = process.env.TIMEZONE_DEFAULT_NAME;

export function extractToken(authorization = '') {
    if (/^Bearer /.test(authorization)) {
        return authorization.substring(7, authorization.length);
    }
    return '';
}

export function hashPassword(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function convertTimeToUTC(time: string | Date) {
    return dayjs.tz(time, 'UTC').toDate();
}

export function isEndOfDay(
    dateTime: string | Date,
    tzName = DEFAULT_TIMEZONE_NAME,
) {
    const time = dayjs
        .tz(convertTimeToUTC(dateTime), tzName)
        .format(DateFormat.HH_mm_ss_COLON);
    return /23:59:59/.test(time);
}

export function isStartOfDay(
    dateTime: string | Date,
    tzName = DEFAULT_TIMEZONE_NAME,
) {
    const time = dayjs
        .tz(convertTimeToUTC(dateTime), tzName)
        .format(DateFormat.HH_mm_ss_COLON);
    return /00:00:00/.test(time);
}

/**
 * Join string to API url instead of writing like
 * `${GITLAB_API_URL}/${GITLAB_PROJECT_ENDPOINT}/${encodedRepositoryEndpoint}/${GITLAB_MERGE_REQUEST_ENDPOINT}/${iid}`
 * @returns URL
 */
export const formatApiUrl = (
    baseUrl: string,
    ...endpoints: (string | number)[]
): string => {
    return `${baseUrl}/${endpoints.join('/')}`;
};

export const getDataFields = (objectDetail: object, fields: string[]) => {
    return _pick(objectDetail, fields);
};

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
