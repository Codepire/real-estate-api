import { IsNotEmpty } from "class-validator";

export class AddTopAssociationsDto {
    @IsNotEmpty()
    association_name: string;

    association_url?: string;
}