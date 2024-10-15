import { IsIn, IsNotEmpty } from 'class-validator';

export class GetFiltersDto {
    @IsNotEmpty()
    @IsIn(['country', 'state', 'city', 'zip'])
    filter: string;
}

// TODO: Add validation
export class GetFiltersQueryDto {
    page: number = 1;

    limit: number = 100;
}
