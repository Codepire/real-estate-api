import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class ContactUsEmailDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsPhoneNumber('US')
    phone_number: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    comments: string;
}
