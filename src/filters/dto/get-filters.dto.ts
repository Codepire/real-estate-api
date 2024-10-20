import { IsIn, IsNotEmpty } from 'class-validator';

export class GetFiltersDto {
    @IsNotEmpty()
    @IsIn([
        'country',
        'state',
        'city',
        'zipcode',
        'builder_names',
        'area',
        'county',
        'masterplannedcommunity'
    ])
    filter: string;
}
