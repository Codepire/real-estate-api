import { IsNumber, IsOptional, Length } from 'class-validator';

export default class GetBlogsDto {
    @IsOptional()
    @Length(1, 100)
    search?: string;

    @IsOptional()
    @IsNumber()
    offset: number = 0;

    @IsOptional()
    @IsNumber()
    limit: number = 10;
}
