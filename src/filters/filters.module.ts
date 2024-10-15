import { Module } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';
import { PropertiesModule } from 'src/properties/properties.module';

@Module({
    imports: [PropertiesModule],
    controllers: [FiltersController],
    providers: [FiltersService],
})
export class FiltersModule {}
