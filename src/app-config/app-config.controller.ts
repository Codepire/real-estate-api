import { Body, Controller, Get, Inject, Patch, Query} from '@nestjs/common';
import { HomeDataService } from './app-config.service';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { IGenericResult } from 'src/common/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums';
import { AddTopCityDto } from './dto/add-top-city.dto';
import { AddTopBuilderDto } from './dto/add-top-builder.dto';
import { GetCitiesDto } from './dto/get-cities.dto';

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
            // todo: uncomment this line before production
            // await this.cacheManager.set('home_data', homeData, 3600000); //1 hour caching
        }
        return {
            message: 'home data found',
            data: {
                home_data: homeData,
            },
        };
    }

    @Roles(UserRoleEnum.ADMIN)
    @Get('home-data/top-cities')
    async getTopCities(
        @Query() query: GetCitiesDto
    ): Promise<IGenericResult> {
        return this.homeDataService.getTopCities(query);
    }

    @Roles(UserRoleEnum.ADMIN)
    @Patch('home-data/top-city')
    async addTopCity(@Body() body: AddTopCityDto): Promise<IGenericResult> {
        return this.homeDataService.addOrRemoveTopEntity(body.city_name, 'top_cities');
    }

    @Roles(UserRoleEnum.ADMIN)
    @Patch('home-data/top-builder')
    async addTopBuilder(
        @Body() body: AddTopBuilderDto,
    ): Promise<IGenericResult> {
        return this.homeDataService.addOrRemoveTopEntity(
            body.builder_name,
            'top_builders',
        );
    }
}
