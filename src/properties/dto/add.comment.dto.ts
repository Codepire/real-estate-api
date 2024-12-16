import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class AddCommentDto {
    @IsNotEmpty()
    @IsString()
    comment: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsPhoneNumber('US')
    phone_number: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
}