import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyEmailDto {
    @IsNotEmpty()
    @Length(6, 6)
    otp: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;
}
