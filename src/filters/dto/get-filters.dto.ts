import { IsIn, IsNotEmpty } from 'class-validator';

export class GetFiltersDto {
    @IsNotEmpty()
    @IsIn(['country', 'state', 'city', 'zip'])
    filter: string;
}
