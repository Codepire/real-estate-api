import { IsNotEmpty } from "class-validator";

export class AddTopPropertyDto {
    @IsNotEmpty()
    property_id: string;
}