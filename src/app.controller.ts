import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipAuth } from './common/decorators/skip-auth.decorator';
import { IGenericResult } from './common/interfaces';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

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
    @Get('builders')
    async getBuilders(): Promise<IGenericResult> {
        return this.appService.getBuilders();
    }

    @SkipAuth()
    @Get('master-planned-communities')
    async getMasterPlannedCommunities(): Promise<IGenericResult> {
        return this.appService.getMasterPlannedCommunities();
    }

    @SkipAuth()
    @Get('counties')
    async getCounties(): Promise<IGenericResult> {
        return this.appService.getCounties();
    }

    @SkipAuth()
    @Get('room-count')
    async getRoomCount(): Promise<IGenericResult> {
        return this.appService.getRoomCount();
    }

    @SkipAuth()
    @Get('zipcodes')
    async getZipCodes(): Promise<IGenericResult> {
        return this.appService.getZipCods();
    }
}
