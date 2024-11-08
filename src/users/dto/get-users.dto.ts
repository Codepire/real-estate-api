import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { Min } from 'class-validator';

export class GetUsersDto {
    searchText?: string;

    @Transform(({ value }) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
            throw new BadRequestException('Page must be number');
        }
        return num;
    })
    @Min(1)
    page?: number;

    @Transform(({ value }) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
            throw new BadRequestException('limit must be number');
        }
        return num;
    })
    @Min(1)
    limit?: number = 10;
}
