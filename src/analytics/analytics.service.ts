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
                wrl.ForLease As for_lease,
                wrl.property_images as property_images
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
                    event_count: parseInt(event_count) || 0,
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
        const result = await this.dataSource.query(
            `
                SELECT
                    u.id,
                    ua.event_name,
                    COUNT(*) AS event_count,
                    CONCAT(u.first_name,' ', u.last_name) AS username,
                    u.email,
                    u.created_at,
                    u.profile_url
                FROM 
                    user_analytics ua
                INNER JOIN
                    users u 
                ON 
                    ua.user_id = u.id
                    AND ua.event_name IN ('property_view', 'property_like')
                    AND ua.event = ?
                GROUP BY
                    u.id, ua.event_name;

                `,
            [propertyId],
        );

        const analytics = {
            user_view: {
                total_views: 0,
                unique_views: 0,
                users: [],
            },
            user_likes: {
                total_likes: 0,
                users: []
            },
        }

        for (let el of result) {
            const { event_name, event, event_count, ...rest } = el;
            if (el.event_name === 'property_view') {
                analytics.user_view.total_views += parseInt(el.event_count || 0);
                analytics.user_view.unique_views++;
                analytics.user_view.users.push({
                    ...rest,
                    event_count: parseInt(event_count) || 0
                });
            } else if (el.event_name === 'property_like') {
                analytics.user_likes.total_likes++;
                analytics.user_likes.users.push(el);
            }
        }

        return {
            message: 'Found property analytics',
            data: {
                analytics
            },
        };
    }
}
