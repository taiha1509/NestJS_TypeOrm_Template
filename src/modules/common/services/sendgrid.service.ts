import { createWinstonLogger } from '@/common/services/winston.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SENDGRID_MODULE } from '../common.constant';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import ConfigKey from '@/common/config/config-key';

@Injectable()
export class SendGridService {
    constructor(private readonly configService: ConfigService) {
        sgMail.setApiKey(this.configService.get(ConfigKey.SENDGRID_API_KEY));
    }
    readonly logger = createWinstonLogger(SENDGRID_MODULE, this.configService);

    async send(message: MailDataRequired) {
        try {
            await sgMail.send(message);
        } catch (error) {
            this.logger.error(`Error in send service, ${error}`);
            throw error;
        }
    }
}
