import { Controller, Get, Param, Query } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { GetFiltersDto } from './dto/get-filters.dto';
import { GetPropertiesByFilterDto } from './dto/get-properties-by-filters.dto';
import { GetFiltersQueryDto } from './dto/pagination.dto';

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

    @Get(':filter/:subfilter')
    async getPropertiesByFilters(
        @Param() filters: GetPropertiesByFilterDto,
        @Query() getFiltersQuery: GetFiltersQueryDto,
    ) {
        const { filter, subfilter } = filters;
        const { limit, page } = getFiltersQuery;
        return this.filtersService.getPropertiesByFilters(filter, subfilter, {
            limit: +limit,
            page: +page,
        });
    }
}
