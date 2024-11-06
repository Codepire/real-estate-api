import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @SkipAuth()
    @Get()
    async temp() {
        return this.analyticsService.temp();
    }
}
