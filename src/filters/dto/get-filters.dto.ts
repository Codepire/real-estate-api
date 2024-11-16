import { IsIn, IsNotEmpty } from 'class-validator';

export class GetFiltersDto {
    @IsNotEmpty()
    @IsIn([
        'builder_names',
        'countries',
        'states',
        'cities',
        'zipcodes',
        'property_types',
        'geo_market_area',
        'school_district',
        'dwelling_type',
        'area',
        'masterplannedcommunity',
        'subdivision',
        'style',
    ])
    filter: string;
}
