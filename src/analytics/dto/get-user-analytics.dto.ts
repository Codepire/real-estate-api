import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { EventTypeEnum } from 'src/common/enums';

export class GetUseranalyticsDto {
    @IsEnum(EventTypeEnum)
    @IsOptional()
    event_name: EventTypeEnum;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    from_date: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    to_date: Date;
}
