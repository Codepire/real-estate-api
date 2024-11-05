import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

export class GetUsersDto {
    searchText?: string;

    @Transform(({ value }) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
            throw new BadRequestException('Page must be number');
        }
        return num;
    })
    page?: number;

    @Transform(({ value }) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
            throw new BadRequestException('limit must be number');
        }
        return num;
    })
    limit?: number = 10;
}
