import { IsNotEmpty, IsUrl, Length } from 'class-validator';

export class CreateBlogDto {
    @IsNotEmpty()
    @Length(1, 100)
    title: string;

    @IsNotEmpty()
    @Length(1, 1000)
    body: string;

    @IsUrl()
    thumbnail_url?: string;

    @IsNotEmpty()
    tag: string;
}
