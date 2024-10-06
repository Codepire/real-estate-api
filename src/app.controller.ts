import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipAuth } from './common/decorators/skip-auth.decorator';
import { IGenericResult } from './common/interfaces';

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
    @Get('zipcodes')
    async getZipCodes(): Promise<IGenericResult> {
        return this.appService.getZipCods();
    }

    @SkipAuth()
    @Get('filter-options')
    async getFilterOptions(): Promise<IGenericResult> {
        const [
            builder_names,
            master_planned_communities,
            counties,
            room_counts,
        ] = await Promise.all([
            this.appService.getBuilders(),
            this.appService.getMasterPlannedCommunities(),
            this.appService.getCounties(),
            this.appService.getRoomCount(),
        ]);
        return {
            message: 'filter options',
            data: {
                builder_names,
                master_planned_communities,
                counties,
                room_counts,
            },
        };
    }
}
