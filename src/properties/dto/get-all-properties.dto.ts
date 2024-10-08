import { IsNotEmpty } from 'class-validator';

export class GetAllPropertiesDto {
    @IsNotEmpty()
    longitude: string;

    @IsNotEmpty()
    latitude: string;

    @IsNotEmpty()
    radius: string;

    beds_total: string;

    property_types: string;

    area: string;

    builder_names: string;

    country: string;

    state: string;

    city: string;

    zipcode: string;

    county: string;

    master_planned_communities: string;

    school_district: string;

    rooms_total: string;

    has_golf_course: boolean;

    has_neighborhood_pool_area: boolean;

    has_private_pool: boolean;

    has_tennis_area: boolean;

    is_furnished: boolean;
}
