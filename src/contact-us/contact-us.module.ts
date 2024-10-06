import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { MailModule } from 'src/mail/mail.module';

@Module({
    imports: [MailModule],
    controllers: [ContactUsController],
    providers: [ContactUsService],
})
export class ContactUsModule {}
