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
                ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) <= ?
            `,
            [query.longitude, query.latitude, query.radius],
        );

        return result;
    }
}
