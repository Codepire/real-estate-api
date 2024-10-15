import { Controller, Get, Param, Query } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { GetFiltersDto, GetFiltersQueryDto } from './dto/get-filters.dto';

@Controller('filters')
export class FiltersController {
    constructor(private readonly filtersService: FiltersService) {}

    @Get(':filter')
    async getFilteredData(
        @Param() getFilterDto: GetFiltersDto,
        @Query() getFiltersQuery: GetFiltersQueryDto,
    ) {
        const { filter } = getFilterDto;
        const { limit, page } = getFiltersQuery;
        return this.filtersService.getFilteredData(filter, +page, +limit);
    }
}
