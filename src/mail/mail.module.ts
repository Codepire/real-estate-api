import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailConfigService } from 'src/config/mail/mail.config';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useClass: MailConfigService,
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
