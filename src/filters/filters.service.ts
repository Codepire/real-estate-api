import { Injectable } from '@nestjs/common';
import { IGenericResult } from 'src/common/interfaces';
import { DataSource } from 'typeorm';

@Injectable()
export class FiltersService {
    constructor(private readonly dataSource: DataSource) {}

    async getFilteredData(
        filter: string,
        page: number,
        limit: number,
    ): Promise<IGenericResult> {
        const offset = (page - 1) * limit;
        const res = await this.dataSource.query(
            `
            SELECT
                DISTINCT ${filter}
            FROM
                wp_realty_listingsdb
            LIMIT ? OFFSET ?;
            `,
            [limit, offset],
        );

        const totalCount = await this.dataSource.query(
            `
            SELECT COUNT(*) AS count
            FROM wp_realty_listingsdb
            `,
        );
        return {
            message: 'Filters found',
            data: {
                filters: res.map((el: any) => el[filter]),
                metadata: {
                    totalCount: totalCount[0]['count'],
                    next: offset + limit < totalCount[0]['count'],
                },
            },
        };
    }
}
