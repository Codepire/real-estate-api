import { Injectable } from '@nestjs/common';
import { ContactUsEmailDto } from './dto/contact-email-us.dto';
import { IGenericResult } from 'src/common/interfaces';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ContactUsService {
    constructor(private readonly mailService: MailService) {}

    async contactUsEmail(
        contactUsEmailDto: ContactUsEmailDto,
    ): Promise<IGenericResult> {
        await this.mailService.sendMail({
            to: 'viral.rupani2004@gmail.com',
            subject: 'Contact Us',
            type: 'CONTACT_US',
            html: '<div>hi</div>', // todo: add contact details template
        });
        return {
            message: 'ok',
        };
    }
}
