import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Length(6, 6)
    otp: string;

    @IsNotEmpty()
    password: string;
}
