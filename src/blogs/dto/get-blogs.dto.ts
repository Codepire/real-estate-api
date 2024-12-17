import { IsIn, IsInt, IsOptional, Length, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export default class GetBlogsDto {
    @IsOptional()
    @Length(1, 100)
    search?: string;

    @IsOptional()
    @Transform(({ value }) => Number(value)) // Transform to number
    @IsInt()
    @Min(0)
    page?: number;

    @IsOptional()
    @Transform(({ value }) => Number(value)) // Transform to number
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsIn(['true', 'false'])
    only_top: string;
}
