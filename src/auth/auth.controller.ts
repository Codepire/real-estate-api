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
import { IGenericResult, ILoginResult } from 'src/common/interfaces';
import { CONSTANTS } from 'src/common/constants';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly JwtService: JwtService,

        /* Custom services */
        private readonly configService: ConfigService,
        private readonly auhService: AuthService,
    ) {}

    /* Google Auth*/
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() {}

    /* Google Auth Callback */
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    googleLoginCallback(@Res() res: Response, @CurrentUser() user: any) {
        const accessToken: string = this.JwtService.sign({
            sub: Date.now(),
            email: user.email,
        });
        const redirectUri = `${this.configService.get('frontend.uri')}/${this.configService.get('frontend.auth_callback')}?token=${accessToken}`;
        res.redirect(redirectUri);
    }

    @Post('register')
    async register(
        @Body() registerUserDto: RegisterUserDto,
    ): Promise<IGenericResult> {
        const registeredUser =
            await this.auhService.registerUser(registerUserDto);
        return {
            message: CONSTANTS.REGISTER_SUCCESS,
            data: registeredUser,
        };
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req): Promise<ILoginResult> {
        const accessToken = this.JwtService.sign({
            sub: req.user.id,
            email: req.user.email,
        });
        return {
            message: CONSTANTS.LOGIN_SUCCESS,
            access_token: accessToken,
            data: {
                user: req.user,
            },
        };
    }
}
