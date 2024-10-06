import { IsNotEmpty } from 'class-validator';

export class GetAllPropertiesDto {
    @IsNotEmpty()
    longitude: string;

    @IsNotEmpty()
    latitude: string;

    @IsNotEmpty()
    radius: string;

    beads_total: string;

    property_types: string;

    area: string;

    builder_name: string;

    country: string;

    state: string;

    city: string;

    zipcode: string;
}
