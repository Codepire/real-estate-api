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

@Module({
    imports: [
        JwtModule.registerAsync({
            useClass: JwtConfigService,
        }),
        TypeOrmModule.forFeature([UsersEntity])
    ],
    controllers: [AuthController],
    providers: [GoogleStrategy, JwtStrategy, AuthService, Cryptography, LocalStrategy],
})
export class AuthModule {}
