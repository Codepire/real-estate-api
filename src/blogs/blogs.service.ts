import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { IGenericResult } from 'src/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsEntity } from './entities/blogs.entity';
import GetBlogsDto from './dto/get-blogs.dto';
import { CONSTANTS } from 'src/common/constants';

@Injectable()
export class BlogsService {
    constructor(
        @InjectRepository(BlogsEntity)
        private readonly blogsRepo: Repository<BlogsEntity>,
    ) {}

    private async findBlogById(id: string): Promise<BlogsEntity> {
        const blog = await this.blogsRepo.findOneBy({ id });
        if (!blog) {
            throw new NotFoundException(CONSTANTS.BLOG_NOT_FOUND);
        }
        return blog;
    }

    async createBlog(createBlogDto: CreateBlogDto): Promise<IGenericResult> {
        try {
            const newBlog = this.blogsRepo.create(createBlogDto);
            const result = await this.blogsRepo.save(newBlog);
            return {
                message: 'Blog created successfully',
                data: { blog: result },
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ConflictException(CONSTANTS.BLOG_URL_CONFLICT);
            }
            throw new InternalServerErrorException();
        }
    }

    async findAllBlogs(getBlogsDto: GetBlogsDto): Promise<IGenericResult> {
        const page = parseInt(String(getBlogsDto.page), 10) || 1;
        const limit = parseInt(String(getBlogsDto.limit), 10) || 100;

        const offset = (page - 1) * limit

        const qb = this.blogsRepo
            .createQueryBuilder('blogs')
            .offset(offset)
            .limit(limit);

        if (getBlogsDto.search) {
            const search = `%${getBlogsDto.search.toLowerCase()}%`;
            qb.where('LOWER(title) LIKE :titleSearch', { titleSearch: search })
                .orWhere('LOWER(body) LIKE :bodySearch', { bodySearch: search })
                .orWhere('LOWER(tag) LIKE :tagSearch', { tagSearch: search });
        }

        const [foundBlogs, count] = await qb.getManyAndCount();
        return {
            data: {
                blogs: foundBlogs,
                metadata: {
                    total: count,
                    totalPages: Math.ceil(count / limit),
                    next: page < Math.ceil(count / limit)
                }
            },
            message: 'Blogs found',
        };
    }

    async findOne(id: string): Promise<IGenericResult> {
        const foundBlog = await this.findBlogById(id);
        return {
            data: { blog: foundBlog },
            message: 'Blog found',
        };
    }

    async updateBlog(
        id: string,
        updateBlogDto: UpdateBlogDto,
    ): Promise<IGenericResult> {
        try {
            const foundBlog = await this.findBlogById(id);

            const updatedBlog = this.blogsRepo.merge(foundBlog, updateBlogDto);
            await this.blogsRepo.save(updatedBlog);

            return {
                message: 'Blog updated successfully',
                data: { blog: updatedBlog },
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ConflictException(CONSTANTS.BLOG_URL_CONFLICT);
            }
            throw new InternalServerErrorException();
        }
    }

    async deleteBlog(id: string): Promise<IGenericResult> {
        const foundBlog = await this.findBlogById(id); // Will throw if not found
        await this.blogsRepo.update({ id }, { deleted_at: new Date() }); // Soft delete
        return {
            message: 'Blog deleted successfully',
            data: {
                blog: foundBlog,
            },
        };
    }
}
