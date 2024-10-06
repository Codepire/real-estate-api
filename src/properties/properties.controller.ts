import { Controller, Get, Param, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { IGenericResult } from 'src/common/interfaces';
import { GetPropertiesStateByZip } from './dto/get-properties-states.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums';

@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) {}

    @SkipAuth()
    @Get()
    async getAllProperties(@Query() query: GetAllPropertiesDto) {
        return this.propertiesService.getAllProperties(query);
    }

    @Roles(UserRoleEnum.ADMIN)
    @Get('properties-states')
    async getPropertiesStateByZip(@Query() query: GetPropertiesStateByZip) {
        return this.propertiesService.getPropertiesStateByZip(query);
    }

    @SkipAuth()
    @Get(':id')
    async getPropertyById(@Param('id') id: string): Promise<IGenericResult> {
        return this.propertiesService.getPropertyById(+id);
    }
}
