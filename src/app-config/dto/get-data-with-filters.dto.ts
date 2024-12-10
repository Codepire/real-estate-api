import { IsIn, IsNotEmpty, IsOptional } from "class-validator";

export class QueryFiltersDto {
    page?: string;

    limit?: string;

    searchText?: string;

    @IsOptional()
    @IsIn(['true', 'false'])
    only_top: 'true' | 'false' = 'false';
}
