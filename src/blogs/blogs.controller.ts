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

    @Roles(UserRoleEnum.USER, UserRoleEnum.ADMIN)
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

    @Roles(UserRoleEnum.USER)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IGenericResult> {
        return this.blogsService.findOne(id);
    }

    @Roles(UserRoleEnum.USER, UserRoleEnum.ADMIN)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateBlogDto: UpdateBlogDto,
    ): Promise<IGenericResult> {
        return this.blogsService.updateBlog(id, updateBlogDto);
    }

    @Roles(UserRoleEnum.USER, UserRoleEnum.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string): Promise<IGenericResult> {
        return this.blogsService.deleteBlog(id);
    }
}
