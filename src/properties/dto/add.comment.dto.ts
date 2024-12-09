import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AddCommentDto {
    @IsNotEmpty()
    @IsString()
    comment: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
}