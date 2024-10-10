import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    Res,
    UseGuards,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { IGenericResult } from 'src/common/interfaces';
import { CONSTANTS } from 'src/common/constants';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import ForgotPasswordDto from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendOtpInput } from './dto/resend-otp.dto';
import { OtpTypesEnum } from 'src/common/enums';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly JwtService: JwtService,

        /* Custom services */
        private readonly configService: ConfigService,
        private readonly auhService: AuthService,
    ) { }

    /* Google Auth*/
    @SkipAuth()
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() { }

    /* Google Auth Callback */
    @SkipAuth()
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    googleLoginCallback(@Res() res: Response, @CurrentUser() user: any) {
        const accessToken: string = this.JwtService.sign({
            sub: Date.now(),
            email: user.email,
            role: user.role,
        });
        const redirectUri = `${this.configService.get('frontend.uri')}/${this.configService.get('frontend.auth_callback')}?token=${accessToken}`;
        res.redirect(redirectUri);
    }

    @SkipAuth()
    @Post('register')
    async register(
        @Body() registerUserDto: RegisterUserDto,
    ): Promise<IGenericResult> {
        const registeredUser =
            await this.auhService.registerUser(registerUserDto);
        return {
            message: CONSTANTS.REGISTER_SUCCESS,
            data: {
                user: registeredUser,
            },
        };
    }

    @SkipAuth()
    @Post('send-otp')
    async sendOtp(@Body() sendOtpInput: SendOtpInput): Promise<IGenericResult> {
        return await this.auhService.sendUserOtp({
            ...sendOtpInput,
            otp_type: OtpTypesEnum.REGISTER_USER,
        });
    }

    @SkipAuth()
    @Post('verify-email')
    async verifyEmail(
        @Body() verifyEmailDto: VerifyEmailDto,
    ): Promise<IGenericResult> {
        await this.auhService.verifyEmail(verifyEmailDto);
        return {
            message: CONSTANTS.EMAIL_VERIFIED,
        };
    }

    @SkipAuth()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req): Promise<IGenericResult> {
        const accessToken = this.JwtService.sign({
            sub: req.user.id,
            email: req.user.email,
            role: req.user.role,
        });
        return {
            message: CONSTANTS.LOGIN_SUCCESS,
            data: {
                user: req.user,
                access_token: accessToken,
            },
        };
    }

    /**
     *
     * @name forgotPassword
     * @description send otp to existing active user to forgot password
     */
    @SkipAuth()
    @Post('forgot-password')
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ): Promise<IGenericResult> {
        // TODO: SEND EMAIL
        const { otp } = await this.auhService.forgotPassword(forgotPasswordDto);
        return {
            message: CONSTANTS.OTP_SENT,
            data: {
                otp, //temp: remove after email configuration
            },
        };
    }

    /**
     *
     * @name resetPasswordDto
     * @description validates otp by email, reset password with new hash and salt.
     */
    @SkipAuth()
    @Post('reset-password')
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<IGenericResult> {
        await this.auhService.resetPassword(resetPasswordDto);
        return {
            message: CONSTANTS.PASSWORD_CHANGED,
        };
    }

    @Post('change-password')
    async changePassword(
        @CurrentUser() user: any,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.auhService.changePassword(user, changePasswordDto);
    }
}
