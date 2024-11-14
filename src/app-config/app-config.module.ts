import { Module } from '@nestjs/common';
import { HomeDataService } from './app-config.service';
import { HomeDataController } from './app-config.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [CacheModule.register()],
    controllers: [HomeDataController],
    providers: [HomeDataService],
})
export class HomeDataModule {}
