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

    async saveUserAnalytics(
        dto: SaveUserAnalyticsDto,
        user: any,
        sessionId: string,
    ): Promise<IGenericResult> {
        console.log(user);
        await this.dataSource.query(
            `INSERT INTO user_analytics (user_id, event_name, event, session) VALUES (?, ?, ?, ?)`,
            [user?.userId, dto.event_name, dto.event, sessionId],
        );
        return {
            message: 'OK',
        };
    }

    async getUserAnalytics(
        userId: string,
        query: GetUseranalyticsDto,
    ): Promise<IGenericResult> {
        let qb = this.dataSource
            .getRepository('user_analytics')
            .createQueryBuilder('ua')
            .select([
                `
                ua.event_name, 
                ua.event, 
                COUNT(*) AS event_count,
                wrl.listingsdb_id,
                wrl.listingsdb_title AS title,
                COALESCE(wrl.BedsTotal, 0) AS beds_total,
                COALESCE(wrl.SqFtTotal, 0) AS sqft_total,
                wrl.BuilderName AS builder_name,
                wrl.Address AS address,
                wrl.OriginalListPrice AS price,
                wrl.ForSale As for_sale,
                wrl.ForLease As for_lease
            `,
            ])
            .where('ua.user_id = :userId', { userId })
            .leftJoin(
                'wp_realty_listingsdb',
                'wrl',
                'ua.event = wrl.listingsdb_id',
            );

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

        qb = qb.andWhere(
            '(ua.event_name = "property_view" OR ua.event_name = "property_like")',
        );
        qb = qb.groupBy('ua.event_name, ua.event, wrl.listingsdb_id');

        let result = await qb.getRawMany();

        const analyticsResult = {
            property_view: {
                total_views: 0,
                unique_views: 0,
                properties: [],
            },
            property_like: {
                total_likes: 0,
                properties: [],
            },
        };

        result.forEach((item) => {
            const { event_name, event, event_count, ...rest } = item;
            if (event_name === 'property_view') {
                analyticsResult.property_view.total_views += +event_count;
                analyticsResult.property_view.unique_views++;
                analyticsResult.property_view.properties.push({
                    ...rest,
                    event_count,
                });
            } else if (event_name === 'property_like') {
                analyticsResult.property_like.total_likes += +event_count;
                analyticsResult.property_like.properties.push(rest);
            }
        });

        return {
            message: 'Found user analytics',
            data: {
                analytics: analyticsResult,
            },
        };
    }

    async getPropertyViewAnalyticsById(
        propertyId: string,
    ): Promise<IGenericResult> {
        const [totoalViews, totalRecievedLikes] = await Promise.all([
            this.dataSource.query(
                `SELECT COUNT(*) AS property_views from user_analytics WHERE event_name = 'property_view' AND event = ?`,
                [propertyId],
            ),
            this.dataSource.query(
                `SELECT COUNT(*) AS total_likes FROM user_analytics WHERE event = ? AND event_name = ?`,
                [propertyId, EventTypeEnum.PROPERTY_LIKE],
            ),
        ]);

        return {
            message: 'Found property analytics',
            data: {
                analytics: {
                    views: totoalViews[0].property_views,
                    likes: totalRecievedLikes[0].total_likes,
                },
            },
        };
    }
}
