import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Injectable()
export class MailConfigService implements MailerOptionsFactory {
    createMailerOptions(): Promise<MailerOptions> | MailerOptions {
        return {
            transport: {
                port: 465,
                secure: true,
                host: process.env.EMAIL_HOST,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            },
            template: {
                dir: join(__dirname, '../../mail/templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        };
    }
}
