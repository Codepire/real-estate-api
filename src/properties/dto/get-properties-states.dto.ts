import { IsNotEmpty, Length } from 'class-validator';

export class GetPropertiesStateByZip {
    @Length(5, 5) //As per USA
    @IsNotEmpty()
    zipcode: string;
}
