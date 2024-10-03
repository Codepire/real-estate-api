import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty()
    old_password: string;

    @IsNotEmpty()
    new_password: string;

    @IsNotEmpty()
    re_new_password: string;
}
