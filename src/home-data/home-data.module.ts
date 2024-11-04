import { Module } from '@nestjs/common';
import { HomeDataService } from './home-data.service';
import { HomeDataController } from './home-data.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [CacheModule.register()],
    controllers: [HomeDataController],
    providers: [HomeDataService],
})
export class HomeDataModule {}
