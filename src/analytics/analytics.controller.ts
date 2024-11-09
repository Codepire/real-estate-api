import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { IGenericResult } from 'src/common/interfaces';
import { SaveUserAnalyticsDto } from './dto/save-user-analytics.dto';
import { CurrentUser } from 'src/common/guards/current-user.guard';
import { GetUseranalyticsDto } from './dto/get-user-analytics.dto';
import { EventTypeEnum, UserRoleEnum } from 'src/common/enums';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @SkipAuth()
    @Get()
    async temp() {
        return this.analyticsService.temp();
    }

    @Post('users')
    async saveUserAnalytics(
        @Body() saveUserAnalyticsDto: SaveUserAnalyticsDto,
        @CurrentUser() user: any,
    ): Promise<IGenericResult> {
        return this.analyticsService.saveUserAnalytics(
            saveUserAnalyticsDto,
            user,
        );
    }

    @Get('users')
    @Roles(UserRoleEnum.ADMIN)
    async getUserAnalytics(
        @CurrentUser() user: any,
        @Query() query: GetUseranalyticsDto,
    ): Promise<IGenericResult> {
        if (!query.event_name) query.event_name = EventTypeEnum.PAGE_VIEW;

        return this.analyticsService.getUserAnalytics(user, query);
    }
}
