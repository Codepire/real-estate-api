import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { IGenericResult } from 'src/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsEntity } from './entities/blogs.entity';
import GetBlogsDto from './dto/get-blogs.dto';

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

    async findAllBlogs(getBlogsDto: GetBlogsDto): Promise<IGenericResult> {
        const qb = this.blogsRepo
            .createQueryBuilder('blogs')
            .offset(getBlogsDto.offset)
            .limit(getBlogsDto.limit);

        if (getBlogsDto.search) {
            const search = `%${getBlogsDto.search.toLowerCase()}%`;
            qb.where('LOWER(title) LIKE :titleSearch', {
                titleSearch: search,
            })
                .orWhere('LOWER(body) LIKE :bodySearch', {
                    bodySearch: search,
                })
                .orWhere('LOWER(tag) LIKE :tagSearch', {
                    tagSearch: search,
                });
        }
        const [foundBlogs, count] = await qb.getManyAndCount();
        return {
            data: {
                blogs: foundBlogs,
                count,
            },
            message: 'blogs found',
        };
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
