import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { SessionInterceptor } from './common/interceptors/session.interceptor';
import * as express from 'express';
import { join } from 'node:path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use('/public', express.static(join(__dirname, '..', 'public')));
    const configService = app.get(ConfigService);
    app.enableCors({
        credentials: true,
        origin: configService.get<string>('cors.origins')?.split(',')
    })
    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.useGlobalInterceptors(new SessionInterceptor());
    await app.listen(configService.get<number>('PORT') || 8000);
}
bootstrap();
