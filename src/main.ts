import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { SessionInterceptor } from './common/interceptors/session.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: '*',
        },
    });
    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());
    app.useGlobalInterceptors(new SessionInterceptor());
    const configService = app.get(ConfigService);
    await app.listen(configService.get<number>('PORT') || 8000);
}
bootstrap();
