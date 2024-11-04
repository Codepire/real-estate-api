import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HomeDataService {
    constructor(private readonly dataSource: DataSource) {}

    async getTopCities() {
        return this.dataSource.query(
            `
                SELECT
                    wrl.city,
                    count(*) AS total_properties
                FROM
                    wp_realty_listingsdb wrl
                WHERE
                    wrl.city IS NOT NULL
                GROUP BY
                    wrl.city
                ORDER BY count(*) DESC
                LIMIT 10;
            `,
        );
    }

    async getTopBuilders() {
        return this.dataSource.query(
            `
                SELECT
                    wrl.BuilderName,
                    count(*) AS total_properties
                FROM
                    wp_realty_listingsdb wrl
                WHERE
                    wrl.BuilderName IS NOT NULL
                GROUP BY
                    wrl.BuilderName
                ORDER BY count(*) DESC
                LIMIT 10;
            `,
        );
    }
}
