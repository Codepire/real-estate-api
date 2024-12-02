import { IsNotEmpty } from "class-validator";

export class DeleteTopAssociationDto {
    @IsNotEmpty()
    association_name: string;
}