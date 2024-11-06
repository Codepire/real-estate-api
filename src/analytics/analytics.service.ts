import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';

@Injectable()
export class AnalyticsService {
    private analyticsDataclient: any;

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
            property: `properties/${this.configService.get('google_analytics.propertyId')}`,
            dateRanges: [
                {
                    startDate: '2020-03-31',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: 'city',
                },
            ],
            metrics: [
                {
                    name: 'activeUsers',
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
