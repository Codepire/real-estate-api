import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

export class GetAllPropertiesDto {
    longitude?: string;

    latitude?: string;

    radius?: string;

    beds_total?: string;

    property_types?: string;

    area?: string;

    builder_names?: string;

    country?: string;

    state?: string;

    city?: string;

    zipcode?: string;

    county?: string;

    masterplannedcommunity?: string;

    school_district?: string;

    rooms_total?: string;

    has_golf_course?: 'true' | 'false';

    has_neighborhood_pool_area?: 'true' | 'false';

    has_private_pool?: 'true' | 'false';

    has_tennis_area?: 'true' | 'false';

    is_furnished?: 'true' | 'false';

    @Transform(({ value }) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
            throw new BadRequestException('Min price must be number');
        }
        return num;
    })
    min_price?: number;

    @Transform(({ value }) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
            throw new BadRequestException('Max price must be number');
        }
        return num;
    })
    max_price?: number;

    limit?: number;

    page?: number;

    geo_market_area?: string;

    style?: string;

    dwelling_type?: string;

    for_sale: 'true' | 'false';

    for_rent: 'true' | 'false';
}
