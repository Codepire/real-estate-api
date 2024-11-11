import {
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { IGenericResult } from 'src/common/interfaces';
import { GetPropertiesStateByZip } from './dto/get-properties-states.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-auth.guard';
import { v4 } from 'uuid';
@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) {}

    @SkipAuth()
    @UseGuards(OptionalJwtAuthGuard)
    @Get()
    async getAllProperties(
        @Query() query: GetAllPropertiesDto,
        @CurrentUser() user: any,
    ) {
        return this.propertiesService.getAllProperties(query, user);
    }

    @Roles(UserRoleEnum.ADMIN)
    @Get('properties-states')
    async getPropertiesStateByZip(@Query() query: GetPropertiesStateByZip) {
        return this.propertiesService.getPropertiesStateByZip(query);
    }

    @Get('likes')
    async likedProperties(@CurrentUser() user: any): Promise<IGenericResult> {
        return this.propertiesService.likedProperties(user);
    }

    /* Like or Unlike Property */
    @SkipAuth()
    @UseGuards(OptionalJwtAuthGuard)
    @Post('likes/:property_id')
    async like(
        @Param('property_id') propertyId: string,
        @CurrentUser() user: any,
        @Req() req: Request,
    ): Promise<IGenericResult> {
        const sessionId = req.cookies['anonymusVisiter'];
        return this.propertiesService.like(propertyId, user, sessionId);
    }

    @SkipAuth()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':id')
    async getPropertyById(
        @Param('id') id: string,
        @Req() req: Request,
        @CurrentUser() user: any,
    ) {
        let sessionId = req.cookies['anonymusVisiter'];

        return await this.propertiesService.getPropertyById(
            +id,
            user,
            sessionId,
        );
    }
}
