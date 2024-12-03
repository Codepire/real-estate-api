import { Body, Controller, Delete, Get, Inject, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
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

@Controller('app-config')
export class HomeDataController {
    constructor(
        private readonly homeDataService: HomeDataService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

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

    @Roles(UserRoleEnum.ADMIN)
    @Get('home-data/top-cities')
    async getTopCities(
        @Query() query: QueryFiltersDto
    ): Promise<IGenericResult> {
        return this.homeDataService.getTopCities(query);
    }

    @Roles(UserRoleEnum.ADMIN)
    @Patch('home-data/top-city')
    async addTopCity(@Body() body: AddTopCityDto): Promise<IGenericResult> {
        return this.homeDataService.addOrRemoveTopEntity(body.city_name, 'top_cities');
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

    @Roles(UserRoleEnum.ADMIN)
    @Get('home-data/top-builders')
    async getTopBuilders(
        @Query() query: QueryFiltersDto
    ): Promise<IGenericResult> {
        return this.homeDataService.getTopBuilders(query);
    }

    @SkipAuth()
    @Patch('home-data/top-associations')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './public',
            filename: (req, file, callback) => {
                const uniqueSuffix = file.originalname.replaceAll(' ', '-') + '-' + Math.round(Math.random() * 1e9);
                const fileExt = extname(file.originalname);
                callback(null, `${uniqueSuffix}${fileExt}`)
            }
        })
    }))
    async addTopAssociations(
        @Body() body: AddTopAssociationsDto,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<IGenericResult> {
        body.association_name = body.association_name?.trim()?.toLowerCase();
        return this.homeDataService.addTopAssociation(
            body, file
        );
    }

    @Get('home-data/top-associations')
    @SkipAuth()
    async getTopAssociations() {
        return await this.homeDataService.getTopAssociations();
    }

    @SkipAuth()
    @Delete('home-data/top-associations')
    async deleteTopAssociation(
        @Body() body: DeleteTopAssociationDto,
    ): Promise<IGenericResult> {
        const association_name = body.association_name?.trim()?.toLowerCase();
        return this.homeDataService.deleteTopAssociation(
            association_name
        );
    }
}
