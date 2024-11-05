import { IsNotEmpty } from 'class-validator';

export class AddTopBuilderDto {
    @IsNotEmpty()
    builder_name: string;
}
