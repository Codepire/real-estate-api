import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { UsersEntity } from 'src/users/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('google_client.id'),
            clientSecret: configService.get<string>('google_client.secret'),
            callbackURL: configService.get<string>(
                'google_client.callback_uri',
            ),
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const res = await this.authService.validateUserGoogleAuth({
            email: emails[0].value,
            first_name: name.givenName,
            last_name: name.familyName,
            profile_url: photos[0].value,
            is_verified_email: true,
        });
        done(null, res);
    }
}
