import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import { IGenericResult } from 'src/common/interfaces';
import { SaveUserAnalyticsDto } from './dto/save-user-analytics.dto';
import { DataSource } from 'typeorm';
import { GetUseranalyticsDto } from './dto/get-user-analytics.dto';
import { EventTypeEnum } from 'src/common/enums';

@Injectable()
export class AnalyticsService {
    private analyticsDataclient: BetaAnalyticsDataClient;

    constructor(
        private readonly configService: ConfigService,
        private readonly dataSource: DataSource,
    ) {
        this.analyticsDataclient = new BetaAnalyticsDataClient({
            keyFilename: path.join(
                process.cwd(),
                'credentials',
                'realestateanalytics-440823-5a6b864ab327.json',
            ),
        });
    }

    async runReport() {
        const [response] = await this.analyticsDataclient.runReport({
            dateRanges: [
                {
                    startDate: '2021-08-01',
                    endDate: 'today',
                },
            ],
            property: `properties/${this.configService.get('google_analytics.propertyId')}`,
            dimensions: [
                {
                    name: 'city',
                },
            ],
            metrics: [
                {
                    name: 'screenPageViews',
                },
            ],
        });

        console.log('Report result:', response);
        response.rows.forEach((row) => {
            console.log(row.dimensionValues[0], row.metricValues[0]);
        });
    }

    async temp() {
        return await this.runReport();
    }

    async saveUserAnalytics(
        dto: SaveUserAnalyticsDto,
        user: any,
    ): Promise<IGenericResult> {
        console.log(user);
        await this.dataSource.query(
            `INSERT INTO user_analytics (user_id, event_name, event) VALUES (?, ?, ?)`,
            [user.userId, dto.event_name, dto.event],
        );
        return {
            message: 'OK',
        };
    }

    async getUserAnalytics(
        user: any,
        query: GetUseranalyticsDto,
    ): Promise<IGenericResult> {
        let qb = this.dataSource
            .getRepository('user_analytics')
            .createQueryBuilder('ua')
            .select(['ua.event_name', 'ua.event', 'COUNT(*) AS event_count'])
            .where('ua.user_id = :userId', { userId: user.userId });

        if (
            query.from_date &&
            query.to_date &&
            query.from_date > query.to_date
        ) {
            qb = qb.andWhere(
                '(ua.created_at BETWEEN :from_date AND :to_date)',
                { fromDate: query.from_date, to_date: query.to_date },
            );
        }

        qb = qb.andWhere('ua.event_name = :eventName', {
            eventName: query.event_name ?? EventTypeEnum.PAGE_VIEW,
        });

        qb = qb.groupBy('ua.event_name, ua.event');

        const result = await qb.getRawMany();

        return {
            message: 'Found user analytics',
            data: {
                analytics: result
            },
        };
    }
}
