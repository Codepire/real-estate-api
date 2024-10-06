import { ISendMailOptions } from '@nestjs-modules/mailer';

export interface IGenericResult {
    message: string;
    data?: any;
}

/* Extending send mail options with type */
export interface ISendMailOption extends ISendMailOptions {
    type: 'REGISTER_OTP' | 'RESET_PASSWORD_OTP' | 'CONTACT_US';
    username?: string;
}
