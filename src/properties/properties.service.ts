import { Injectable } from '@nestjs/common';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class PropertiesService {
    constructor(private readonly dataSource: DataSource) {}
    async getAllProperties(query: GetAllPropertiesDto) {
        const result = await this.dataSource.query(
            `
            SELECT
                wrl.latitude,
                wrl.longitude,
                wrl.listingsdb_title as title
            FROM
                wp_realty_listingsdb wrl
            WHERE
                wrl.City = ?
            LIMIT
                ? OFFSET ?
            `,
            [query.city, 50, 0], // Note that OFFSET comes after LIMIT in the parameter array
        );

        return result;
    }
}
