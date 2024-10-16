import { IsIn, IsNotEmpty } from 'class-validator';

export class GetFiltersDto {
    @IsNotEmpty()
    @IsIn(['countries', 'states', 'cities', 'zips', 'builder_names'])
    filter: string;
}
