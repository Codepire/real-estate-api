import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [PropertiesController],
    providers: [PropertiesService],
    exports: [PropertiesService],
})
export class PropertiesModule {}
