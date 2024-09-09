import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly JwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    /* Google Auth*/
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() {}

    /* Google Auth Callback */
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    googleLoginCallback(
        @Res() res: Response,
        @CurrentUser() user: any,
    ) {
        const accessToken: string = this.JwtService.sign({
            sub: Date.now(),
            email: user.email,
        });
        const redirectUri = `${this.configService.get('frontend.uri')}/${this.configService.get('frontend.auth_callback')}?token=${accessToken}`;
        res.redirect(redirectUri);
    }
}
