import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createJwtOptions(): Promise<JwtModuleOptions> | JwtModuleOptions {
        const { secret, expiry } = this.configService.get('jwt');
        return {
            secret,
            signOptions: { expiresIn: expiry },
        };
    }
}
