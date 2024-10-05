import { Controller, Get, Param, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { IGenericResult } from 'src/common/interfaces';

@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) {}

    @Get()
    @SkipAuth() //todo: temp till frontend don't get ready for apis
    async getAllProperties(@Query() query: GetAllPropertiesDto) {
        return this.propertiesService.getAllProperties(query);
    }

    @SkipAuth()
    @Get(':id')
    async getPropertyById(@Param('id') id: string): Promise<IGenericResult> {
        return this.propertiesService.getPropertyById(+id);
    }
}
