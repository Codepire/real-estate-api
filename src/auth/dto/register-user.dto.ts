import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, ValidateIf } from "class-validator";

export class RegisterUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;

    @IsPhoneNumber('IN')
    phone_number: string;

    profile_url: string;
}
