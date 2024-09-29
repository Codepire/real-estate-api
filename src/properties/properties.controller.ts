import {  Controller, Get, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
  ) {}

  @Get()
  @SkipAuth() //todo: temp till frontend don't get ready for apis
  getAllProperties(
    @Query() query: GetAllPropertiesDto
  ) {
    return this.propertiesService.getAllProperties(query)
  }

}
