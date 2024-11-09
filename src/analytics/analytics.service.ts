import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';

@Injectable()
export class AnalyticsService {
    private analyticsDataclient: BetaAnalyticsDataClient;

    constructor(private readonly configService: ConfigService) {
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
}
