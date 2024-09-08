import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() {
        // Initiates the Google OAuth2 login flow
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    googleLoginCallback(@Req() req) {
        // Once the user is authenticated, Google will redirect to this route
        // and the req.user will contain the authenticated user's information
        return {
            message: 'User info from Google',
            user: req.user,
        };
    }
}
