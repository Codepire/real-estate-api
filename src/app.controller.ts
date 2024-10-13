import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipAuth } from './common/decorators/skip-auth.decorator';
import { IGenericResult } from './common/interfaces';

// TODO: HAVE TO FILTER THINGS ON LATITUDE LONGITUDE IN FUTURE, E.G. SCHOOL AREA
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

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
        const [
            builder_names,
            master_planned_communities,
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
        return {
            message: 'filter options',
            data: {
                property_types,
                builder_names,
                master_planned_communities,
                counties,
                rooms_total,
                beds_total,
                school_districts,
            },
        };
    }
}
