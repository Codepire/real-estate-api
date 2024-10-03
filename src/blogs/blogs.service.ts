import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { IGenericResult } from 'src/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsEntity } from './entities/blogs.entity';

@Injectable()
export class BlogsService {
    constructor(
        @InjectRepository(BlogsEntity)
        private readonly blogsRepo: Repository<BlogsEntity>,
    ) {}

    async createBlog(createBlogDto: CreateBlogDto): Promise<IGenericResult> {
        await this.blogsRepo.insert(createBlogDto);
        return {
            message: 'Blog created successfully',
        };
    }

    findAll() {
        return `This action returns all blogs`;
    }

    findOne(id: number) {
        return `This action returns a #${id} blog`;
    }

    update(id: number, updateBlogDto: UpdateBlogDto) {
        return `This action updates a #${id} blog`;
    }

    remove(id: number) {
        return `This action removes a #${id} blog`;
    }
}
