import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';

@Controller('blogs')
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}

    @SkipAuth()
    @Post()
    create(@Body() createBlogDto: CreateBlogDto) {
        return this.blogsService.createBlog(createBlogDto);
    }

    @Get()
    findAll() {
        return this.blogsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.blogsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
        return this.blogsService.update(+id, updateBlogDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.blogsService.remove(+id);
    }
}
