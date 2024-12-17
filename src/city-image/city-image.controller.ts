import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CityImageService } from './city-image.service';
import { CreateCityImageDto } from './dto/create-city-image.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';

@Controller('city-image')
export class CityImageController {
  constructor(private readonly cityImageService: CityImageService) {}

  @Post()
  @SkipAuth()
  create(@Body() createCityImageDto: CreateCityImageDto) {
    return this.cityImageService.create(createCityImageDto);
  }

  @Get(':id')
  @SkipAuth()
  findOne(@Param('id') id: string) {
    return this.cityImageService.findOne(id);
  }
}
