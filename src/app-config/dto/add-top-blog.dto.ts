import { IsNotEmpty, IsString } from "class-validator";

export class AddTopBlogDto {
    @IsNotEmpty()
    blog_id: number;
}