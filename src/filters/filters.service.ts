import { Injectable } from '@nestjs/common';
import { IGenericResult } from 'src/common/interfaces';
import { PropertiesService } from 'src/properties/properties.service';
import { DataSource } from 'typeorm';

@Injectable()
export class FiltersService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly propertiesService: PropertiesService,
    ) {}

    async getFilteredData(
        filter: string,
        page: number,
        limit: number,
    ): Promise<IGenericResult> {
        const offset = (page - 1) * limit;

        if (filter === 'builder_names') {
            filter = 'builderName';
        } else if (filter === 'countries') {
            filter = 'country';
        } else if (filter === 'states') {
            filter = 'state';
        } else if (filter === 'cities') {
            filter = 'city';
        } else if (filter === 'zipcode') {
            filter = 'zip';
        } else if (filter === 'property_types') {
            filter = 'PropertyType';
        } else if (filter === 'geo_market_area') {
            filter = 'GeoMarketArea';
        } else if (filter === 'school_district') {
            filter = 'SchoolDistrict';
        }

        const [foundFilters, totalCount] = await Promise.all([
            this.dataSource.query(
                `
                SELECT
                    DISTINCT ${filter}
                FROM
                    wp_realty_listingsdb
                WHERE
                    ${filter} IS NOT NULL
                AND
                    ${filter} <> ''
                ORDER BY
                    ${filter} ASC
                LIMIT ? OFFSET ?;
                `,
                [limit, offset],
            ),
            this.dataSource.query(
                `
                    SELECT COUNT(DISTINCT ${filter}) AS count
                    FROM wp_realty_listingsdb
                    `,
            ),
        ]);

        return {
            message: 'Filters found',
            data: {
                filters: foundFilters.map((el: any) => el[filter]),
                metadata: {
                    totalCount: totalCount[0]['count'],
                    next: offset + limit < totalCount[0]['count'],
                    totalPages: Math.ceil(totalCount[0]['count'] / limit),
                },
            },
        };
    }

    async getPropertiesByFilters(
        filter: string,
        subfilter: string,
        { page, limit }: { page: number; limit: number },
    ) {
        const offset = (page - 1) * limit;
        const [foundProperties, totalCount] = await Promise.all([
            this.dataSource.query(
                `
                SELECT
                    ${this.propertiesService.getFrequentlySelectedPropertyFields()}
                FROM
                    wp_realty_listingsdb wrl
                WHERE ${filter} = ?
                LIMIT ? OFFSET ?;
                `,
                [subfilter, limit, offset],
            ),
            this.dataSource.query(
                `
                SELECT COUNT(*) AS count
                FROM wp_realty_listingsdb
                WHERE ${filter} = ?
                `,
                [subfilter],
            ),
        ]);

        return {
            message: 'Properties found',
            data: {
                properties: foundProperties,
                metadata: {
                    totalCount: totalCount[0]['count'],
                    next: offset + limit < totalCount[0]['count'],
                },
            },
        };
    }
}
