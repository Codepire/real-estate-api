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
        searchText?: string,
    ): Promise<IGenericResult> {
        const offset = (page - 1) * limit;

        const filterMapping: Record<string, string> = {
            builder_names: 'builderName',
            zipcode: 'zip',
            property_types: 'PropertyType',
            geo_market_area: 'GeoMarketArea',
            school_district: 'SchoolDistrict',
            dwelling_type: 'DwellingType',
        };

        filter = filterMapping[filter] || filter;
        const searchLowerText = searchText?.toLowerCase()?.trim() || '';

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
                    LOWER(${filter}) 
                    NOT IN ('', 'na', 'n/a', '-', '--', '.', '*', '/na', '(not subdivided)', '0', '00', '000', '0000')
                AND
                    LOWER(${filter}) LIKE ?
                ORDER BY
                    ${filter} ASC
                LIMIT ? OFFSET ?;
                `,
                [`%${searchLowerText}%`, limit, offset],
            ),
            this.dataSource.query(
                `
                SELECT COUNT(DISTINCT ${filter}) AS count
                    FROM wp_realty_listingsdb
                WHERE
                    ${filter} IS NOT NULL
                AND
                    LOWER(${filter}) 
                    NOT IN ('', 'na', 'n/a', '-', '--', '.', '*', '/na', '(not subdivided)', '0', '00', '000', '0000')
                AND
                    LOWER(${filter}) LIKE ?
                `,
                [`%${searchLowerText}%`, limit, offset],
            ),
        ]);

        return {
            message: 'Filters found',
            data: {
                filters: foundFilters.map((el: any) => el[filter]),
                metadata: {
                    totalCount: parseInt(totalCount[0]['count']) || 0,
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
