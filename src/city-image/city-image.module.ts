import { Module } from '@nestjs/common';
import { CityImageService } from './city-image.service';
import { CityImageController } from './city-image.controller';

@Module({
  controllers: [CityImageController],
  providers: [CityImageService],
})
export class CityImageModule {}
