import { IsNotEmpty } from 'class-validator';

export class AddTopCityDto {
    @IsNotEmpty()
    city_name: string;
}
