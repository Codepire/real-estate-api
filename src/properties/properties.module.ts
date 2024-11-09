import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { HttpModule } from '@nestjs/axios';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
    imports: [HttpModule, AnalyticsModule],
    controllers: [PropertiesController],
    providers: [PropertiesService],
    exports: [PropertiesService],
})
export class PropertiesModule {}
