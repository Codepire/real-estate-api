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
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import GetBlogsDto from './dto/get-blogs.dto';
import { IGenericResult } from 'src/common/interfaces';

/**
 * TODO: Remaining stuff
 *  - Role based authentication, have to confirm
 *  - Restrict access for blog update and delete
 */
@Controller('blogs')
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}

    @SkipAuth()
    @Post()
    async create(
        @Body() createBlogDto: CreateBlogDto,
    ): Promise<IGenericResult> {
        return this.blogsService.createBlog(createBlogDto);
    }

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

    @SkipAuth()
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateBlogDto: UpdateBlogDto,
    ): Promise<IGenericResult> {
        return this.blogsService.updateBlog(id, updateBlogDto);
    }

    @SkipAuth()
    @Delete(':id')
    remove(@Param('id') id: string): Promise<IGenericResult> {
        return this.blogsService.deleteBlog(id);
    }
}
