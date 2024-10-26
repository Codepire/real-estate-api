import { Controller, Get, Inject, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipAuth } from './common/decorators/skip-auth.decorator';
import { IGenericResult } from './common/interfaces';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// TODO: HAVE TO FILTER THINGS ON LATITUDE LONGITUDE IN FUTURE, E.G. SCHOOL AREA
@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @SkipAuth()
    @Get('countries')
    async getCountries(): Promise<IGenericResult> {
        return this.appService.getCountries();
    }

    @SkipAuth()
    @Get(':country/states')
    async getStatesByCountries(
        @Param('country') country: string,
    ): Promise<IGenericResult> {
        return this.appService.getStatesByCountry(country);
    }

    @SkipAuth()
    @Get(':state/cities')
    async getCitiesByState(
        @Param('state') state: string,
    ): Promise<IGenericResult> {
        return this.appService.getCitiesByState(state);
    }

    @SkipAuth()
    @Get(':city/zipcodes')
    async getZipCodesByCity(
        @Param('city') city: string,
    ): Promise<IGenericResult> {
        return this.appService.getZipCodesByCity(city);
    }

    @SkipAuth()
    @Get(':zipcode/geo-market-area')
    async getGeoMarketAreasByZip(
        @Param('zipcode') zipcode: string,
    ): Promise<IGenericResult> {
        return this.appService.getGeoMarketAreasByZip(zipcode);
    }

    @SkipAuth()
    @Get('filter-options')
    async getFilterOptions(): Promise<IGenericResult> {
        const cachedData = await this.cacheManager.get<any>('filter-options');
        let filterOptions = {};
        if (cachedData) {
            filterOptions = {
                property_types: cachedData.property_types,
                builder_names: cachedData.builder_names,
                masterplannedcommunity: cachedData.masterplannedcommunity,
                counties: cachedData.counties,
                rooms_total: cachedData.rooms_total,
                beds_total: cachedData.beds_total,
                school_districts: cachedData.school_districts,
            };
        } else {
            const [
                builder_names,
                masterplannedcommunity,
                counties,
                rooms_total,
                beds_total,
                school_districts,
                property_types,
            ] = await Promise.all([
                this.appService.getBuilders(),
                this.appService.getMasterPlannedCommunities(),
                this.appService.getCounties(),
                this.appService.getRoomCount(),
                this.appService.getBedRoomCount(),
                this.appService.getSchoolDistricts(),
                this.appService.getPropertyTypes(),
            ]);
            filterOptions = {
                property_types,
                builder_names,
                masterplannedcommunity,
                counties,
                rooms_total,
                beds_total,
                school_districts,
            };
            await this.cacheManager.set(
                'filter-options',
                filterOptions,
                100000,
            );
        }

        return {
            message: 'filter options',
            data: filterOptions,
        };
    }

    @SkipAuth()
    @Get('home-data')
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
                this.appService.getTopCities(),
                this.appService.getTopBuilders(),
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
