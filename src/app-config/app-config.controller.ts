import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Patch,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { HomeDataService } from './app-config.service';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { IGenericResult } from 'src/common/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums';
import { AddTopCityDto } from './dto/add-top-city.dto';
import { AddTopBuilderDto } from './dto/add-top-builder.dto';
import { QueryFiltersDto } from './dto/get-data-with-filters.dto';
import { AddTopAssociationsDto } from './dto/add-top-associations.dto';
import { DeleteTopAssociationDto } from './dto/delete-top-associations.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CONSTANTS } from 'src/common/constants';
import { AddTopPropertyDto } from './dto/add-top-property.dto';
import { AddTopBlogDto } from './dto/add-top-blog.dto';

@Controller('app-config')
export class HomeDataController {
    constructor(
        private readonly homeDataService: HomeDataService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    @SkipAuth()
    @Get('home-data')
    async getTopEntities(): Promise<IGenericResult> {
        let homeData = await this.cacheManager.get('home_data');
        if (!homeData) {
            homeData = await this.homeDataService.getTopEntities();
            // todo: uncomment this line before production
            // await this.cacheManager.set('home_data', homeData, 3600000); //1 hour caching
        }
        return {
            message: 'home data found',
            data: {
                home_data: homeData,
            },
        };
    }

    @SkipAuth()
    @Get('home-data/top-cities')
    async getTopCities(
        @Query() query: QueryFiltersDto,
    ): Promise<IGenericResult> {
        return this.homeDataService.getTopCities(query);
    }

    @Roles(UserRoleEnum.ADMIN)
    @Patch('home-data/top-city')
    async addTopCity(@Body() body: AddTopCityDto): Promise<IGenericResult> {
        return this.homeDataService.addOrRemoveTopEntity(
            body.city_name,
            'top_cities',
        );
    }

    @Roles(UserRoleEnum.ADMIN)
    @Patch('home-data/top-builder')
    async addTopBuilder(
        @Body() body: AddTopBuilderDto,
    ): Promise<IGenericResult> {
        return this.homeDataService.addOrRemoveTopEntity(
            body.builder_name,
            'top_builders',
        );
    }

    // available for front and admin both user type
    @Roles(UserRoleEnum.ADMIN)
    @Patch('home-data/top-property')
    async addTopProperty(
        @Body() body: AddTopPropertyDto,
    ): Promise<IGenericResult> {
        return this.homeDataService.addOrRemoveTopEntity(
            body.property_id,
            'top_properties',
        );
    }

    @Get('home-data/top-property')
    async getTopProperty(): Promise<IGenericResult> {
        return this.homeDataService.getTopProperties();
    }

    @Roles(UserRoleEnum.ADMIN)
    @Get('home-data/top-builders')
    async getTopBuilders(
        @Query() query: QueryFiltersDto,
    ): Promise<IGenericResult> {
        return this.homeDataService.getTopBuilders(query);
    }

    @Roles(UserRoleEnum.ADMIN)
    @Patch('home-data/top-associations')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './public/home-data/top-associations',
                filename: (req, file, callback) => {
                    const uniqueSuffix =
                        file.originalname.replaceAll(' ', '-') +
                        '-' +
                        Math.round(Math.random() * 1e9);
                    const fileExt = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${fileExt}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedMimeTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                ];
                if (allowedMimeTypes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(
                        new BadRequestException(CONSTANTS.INVALID_FILE_TYPE),
                        false,
                    ); // Reject the file
                }
            },
        }),
    )
    async addTopAssociations(
        @Body() body: AddTopAssociationsDto,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<IGenericResult> {
        body.association_name = body.association_name?.trim()?.toLowerCase();
        body.association_url = body.association_url?.trim()?.toLowerCase();
        return this.homeDataService.addTopAssociation(body, file);
    }

    @Roles(UserRoleEnum.ADMIN)
    @Get('home-data/top-associations')
    async getTopAssociations() {
        return await this.homeDataService.getTopAssociations();
    }

    @Roles(UserRoleEnum.ADMIN)
    @Delete('home-data/top-associations')
    async deleteTopAssociation(
        @Body() body: DeleteTopAssociationDto,
    ): Promise<IGenericResult> {
        const association_name = body.association_name?.trim()?.toLowerCase();
        return this.homeDataService.deleteTopAssociation(association_name);
    }

    @Roles(UserRoleEnum.ADMIN)
    @Patch('home-data/top-blogs')
    async addTopBlog(
        @Body() body: AddTopBlogDto,
    ) {
        return this.homeDataService.addTopBlog({ blog_id: body.blog_id });
    }

    @Get('home-data/top-blogs')
    async getTopBlogs() {
        return this.homeDataService.getTopBlogs();
    }
}
