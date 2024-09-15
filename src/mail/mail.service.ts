import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISendMailOption } from 'src/common/interfaces';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}
    async sendMail(options: ISendMailOption) {
        if (options.type === 'REGISTER_OTP') {
            options.template = './register-user-otp';
        }
        this.mailerService.sendMail({
            from: this.configService.get('email').user,
            ...options,
        });
    }
}
