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
import { DataSource, Repository } from 'typeorm';
import { BlogsEntity } from './entities/blogs.entity';
import GetBlogsDto from './dto/get-blogs.dto';
import { CONSTANTS } from 'src/common/constants';

@Injectable()
export class BlogsService {
    constructor(
        @InjectRepository(BlogsEntity)
        private readonly blogsRepo: Repository<BlogsEntity>,

        private readonly dataSource: DataSource
    ) {}

    private async findBlogById(id: string): Promise<BlogsEntity> {
        const blog = await this.blogsRepo.findOneBy({ id });
        if (!blog) {
            throw new NotFoundException(CONSTANTS.BLOG_NOT_FOUND);
        }
        return blog;
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
            qb.where('(LOWER(title) LIKE :searchText OR LOWER(body) LIKE :searchText)', { searchText: search })
        }

        const foundTopBlogs = await this.dataSource.query(`
                SELECT entities FROM top_entities WHERE alias = 'top_blogs'
            `);

        if (getBlogsDto.only_top === 'true') {
            console.log('true')
            qb.andWhere('id IN (:...ids)', {ids: foundTopBlogs[0].entities.map((el: any) => el.id)});
        }
        
        let  [foundBlogs, count] = await qb.getManyAndCount();

        const foundEneities = foundTopBlogs[0].entities;

        foundBlogs = foundBlogs.map((blog: any) => {
            if (foundEneities.some(el => el.id === blog.id)) {
                return {
                    ...blog,
                    is_top: true
                }
            } else {
                return {
                    ...blog,
                    is_top: false
                };
            }
        })

        return {
            data: {
                blogs: foundBlogs,
                metadata: {
                    total: count,
                    totalPages: Math.ceil(count / limit),
                    next: page < Math.ceil(count / limit),
                    totalTopBlogs: foundEneities?.length,
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
}
