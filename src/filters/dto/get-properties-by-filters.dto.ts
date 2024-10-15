import { GetFiltersDto } from './get-filters.dto';

export class GetPropertiesByFilterDto extends GetFiltersDto {
    subfilter: string;
}
