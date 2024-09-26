import { IsNotEmpty } from "class-validator";

export class GetAllPropertiesDto {
    @IsNotEmpty()
    longitude: string;

    @IsNotEmpty()
    latitude: string;

    @IsNotEmpty()
    radius: string;
}