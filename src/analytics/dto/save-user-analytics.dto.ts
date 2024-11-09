import { IsEnum, IsNotEmpty, Length, Matches, Validate } from 'class-validator';
import { EventTypeEnum } from 'src/common/enums';

export class SaveUserAnalyticsDto {
    @IsNotEmpty()
    // @Matches(/^\/.*/, {
    //     message: 'page must start with "/"',
    // })
    @Length(1, 255)
    event: string;

    @IsNotEmpty()
    @IsEnum(EventTypeEnum)
    event_name: EventTypeEnum;
}
