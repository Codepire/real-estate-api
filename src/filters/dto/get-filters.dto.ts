import { IsIn, IsNotEmpty } from 'class-validator';

export class GetFiltersDto {
    @IsNotEmpty()
    @IsIn([
        'builder_names',
        'country',
        'state',
        'city',
        'zipcode',
        'property_types',
        'geo_market_area',
        'school_district',
        'dwelling_type',
        'area',
        'masterplannedcommunity',
        'subdivision',
        'style',
        'county',
    ])
    filter: string;
}
