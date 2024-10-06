import { Body, Controller, Post } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsEmailDto } from './dto/contact-email-us.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';

@Controller('contact-us')
export class ContactUsController {
    constructor(private readonly contactUsService: ContactUsService) {}

    @SkipAuth()
    @Post('mail')
    async contactUsEmail(@Body() contactUsEmailDto: ContactUsEmailDto) {
        return await this.contactUsService.contactUsEmail(contactUsEmailDto);
    }
}
