import { Controller, Get, Inject } from '@nestjs/common';
import { HomeDataService } from './home-data.service';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { IGenericResult } from 'src/common/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('home-data')
export class HomeDataController {
    constructor(
        private readonly homeDataService: HomeDataService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    @SkipAuth()
    @Get()
    async getTopCities(): Promise<IGenericResult> {
        const cachedData = await this.cacheManager.get<{
            topCities: any;
            topBuilders: any;
        }>('home-data');
        let resData = {};
        if (cachedData) {
            resData = {
                topCities: cachedData?.topCities,
                topBuilders: cachedData?.topBuilders,
            };
        } else {
            const [topCities, topBuilders] = await Promise.all([
                this.homeDataService.getTopCities(),
                this.homeDataService.getTopBuilders(),
            ]);
            resData = {
                topCities,
                topBuilders,
            };
            await this.cacheManager.set('home-data', resData, 100000);
        }

        return {
            message: 'top cities found',
            data: {
                homeData: resData,
            },
        };
    }
}
