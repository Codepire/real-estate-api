import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsEntity } from './entities/blogs.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BlogsEntity])],
    controllers: [BlogsController],
    providers: [BlogsService],
})
export class BlogsModule {}
