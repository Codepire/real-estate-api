import { Body, Controller, Delete, Get, Inject, Post } from '@nestjs/common';
import { HomeDataService } from './app-config.service';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { IGenericResult } from 'src/common/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums';
import { AddTopCityDto } from './dto/add-top-city.dto';
import { DeleteTopCityDto } from './dto/delete-top-city.dto';
import { AddTopBuilderDto } from './dto/add-top-builder.dto';
import { DeleteTopBuilderDto } from './dto/delete-top-builder.dto';

@Controller('app-config')
export class HomeDataController {
    constructor(
        private readonly homeDataService: HomeDataService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    @SkipAuth()
    @Get('home-data')
    async getTopEntities(): Promise<IGenericResult> {
        let homeData = await this.cacheManager.get('home_data');
        if (!homeData) {
            homeData = await this.homeDataService.getTopEntities();
            await this.cacheManager.set('home_data', homeData, 3600000); //1 hour caching
        }
        return {
            message: 'home data found',
            data: {
                home_data: homeData,
            },
        };
    }

    @Roles(UserRoleEnum.ADMIN)
    @Post('top-city')
    async addTopCity(@Body() body: AddTopCityDto): Promise<IGenericResult> {
        return this.homeDataService.addTopEntity(body.city_name, 'top_cities');
    }

    @Roles(UserRoleEnum.ADMIN)
    @Delete('top-city')
    async deleteTopCity(
        @Body() body: DeleteTopCityDto,
    ): Promise<IGenericResult> {
        return this.homeDataService.removeTopEntity(
            body.city_name,
            'top_cities',
        );
    }

    @Roles(UserRoleEnum.ADMIN)
    @Post('top-builder')
    async addTopBuilder(
        @Body() body: AddTopBuilderDto,
    ): Promise<IGenericResult> {
        return this.homeDataService.addTopEntity(
            body.builder_name,
            'top_builders',
        );
    }

    @Roles(UserRoleEnum.ADMIN)
    @Delete('top-builder')
    async deleteTopBuilder(
        @Body() body: DeleteTopBuilderDto,
    ): Promise<IGenericResult> {
        return this.homeDataService.removeTopEntity(
            body.builder_name,
            'top_builders',
        );
    }
}
