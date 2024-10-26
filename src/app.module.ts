import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfigService } from './config/typeorm/typeorm.config';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { PropertiesModule } from './properties/properties.module';
import { BlogsModule } from './blogs/blogs.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { FiltersModule } from './filters/filters.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            envFilePath: ['.env.development.local', '.env.development'],
            isGlobal: true,
            load: [configuration],
        }),
        TypeOrmModule.forRootAsync({
            useClass: TypeormConfigService,
        }),
        UsersModule,
        MailModule,
        PropertiesModule,
        BlogsModule,
        ContactUsModule,
        FiltersModule,
        CacheModule.register(),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
