import { Controller, Get, Param, Query } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { GetFiltersDto } from './dto/get-filters.dto';
import { GetPropertiesByFilterDto } from './dto/get-properties-by-filters.dto';
import { GetFiltersQueryDto } from './dto/pagination.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';

@Controller('filters/dynamic/')
export class FiltersController {
    constructor(private readonly filtersService: FiltersService) {}

    @SkipAuth()
    @Get(':filter')
    async getFilteredData(
        @Param() getFilterDto: GetFiltersDto,
        @Query() getFiltersQuery: GetFiltersQueryDto,
    ) {
        const { filter } = getFilterDto;
        const { limit, page, searchText } = getFiltersQuery;
        return this.filtersService.getFilteredData(filter, parseInt(page, 10) || 1, parseInt(limit, 10) || 50, searchText);
    }

    @SkipAuth()
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
