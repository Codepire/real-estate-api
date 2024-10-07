import { IsEmail } from 'class-validator';
import { OtpTypesEnum } from 'src/common/enums';

export class SendOtpInput {
    @IsEmail()
    email: string;

    otp_type: OtpTypesEnum;
}
