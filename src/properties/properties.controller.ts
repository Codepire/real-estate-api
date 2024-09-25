import {  Controller, Get, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
  ) {}

  @Get()
  getAllProperties(
    @Query() query: GetAllPropertiesDto
  ) {
    return this.propertiesService.getAllProperties(query)
  }

}
