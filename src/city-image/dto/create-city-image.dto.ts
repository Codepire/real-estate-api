import { IsNotEmpty } from "class-validator";

export class CreateCityImageDto {
    @IsNotEmpty()
    city: string;

    @IsNotEmpty()
    image_url: string;
}
