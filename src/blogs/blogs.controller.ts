import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import GetBlogsDto from './dto/get-blogs.dto';
import { IGenericResult } from 'src/common/interfaces';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';

@Controller('blogs')
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}
    @SkipAuth()
    @Get()
    async findAll(@Query() query: GetBlogsDto): Promise<IGenericResult> {
        return this.blogsService.findAllBlogs(query);
    }

    @SkipAuth()
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IGenericResult> {
        return this.blogsService.findOne(id);
    }
}
