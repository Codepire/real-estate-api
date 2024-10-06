import { Module } from '@nestjs/common';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from 'src/config/jwt/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/user.entity';
import { Cryptography } from 'src/common/cryptography';
import { LocalStrategy } from './strategies/local.strategy';
import { OtpEntity } from 'src/users/entities/otp.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { MailModule } from 'src/mail/mail.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            useClass: JwtConfigService,
        }),
        TypeOrmModule.forFeature([UsersEntity, OtpEntity]),
        MailModule,
    ],
    controllers: [AuthController],
    providers: [
        GoogleStrategy,
        JwtStrategy,
        AuthService,
        Cryptography,
        LocalStrategy,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AuthModule {}
