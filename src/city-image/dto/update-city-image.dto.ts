import { PartialType } from '@nestjs/mapped-types';
import { CreateCityImageDto } from './create-city-image.dto';

export class UpdateCityImageDto extends PartialType(CreateCityImageDto) {}
