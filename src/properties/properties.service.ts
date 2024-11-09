import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { DataSource } from 'typeorm';
import { IGenericResult } from 'src/common/interfaces';
import { CONSTANTS } from 'src/common/constants';
import { GetPropertiesStateByZip } from './dto/get-properties-states.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { UsersEntity } from 'src/users/entities/user.entity';
import { PropertyLikesEntity } from './entieis/property-likes.entity';

@Injectable()
export class PropertiesService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    getFrequentlySelectedPropertyFields(): string[] {
        return [
            'wrl.listingsdb_id AS id',
            'wrl.Address AS address',
            'wrl.latitude AS latitude',
            'wrl.longitude AS longitude',
            'wrl.listingsdb_title AS title',
            'wrl.BedsTotal AS beds_total',
            'wrl.PropertyType AS property_type',
            'wrl.Subdivision AS subdivision',
            'wrl.YearBuilt AS year_built',
            'wrl.Zip AS zipcode',
            'wrl.Country AS country',
            'wrl.State AS state',
            'wrl.Roof AS roof_type',
            'wrl.RoomCount AS rooms_total',
            'wrl.OriginalListPrice AS price',
            'wrl.SqFtTotal AS sqft_total',
            'wrl.Electric AS electric',
            'wrl.Appliances AS appliances',
            'wrl.StreetName AS street_name',
            'wrl.StreetSuffix AS street_suffix',
            'wrl.AcresDesciption AS acres_description',
            'wrl.Area AS area',
            'wrl.BathsFull AS baths_full',
            'wrl.BuilderName AS builder_name',
            'wrl.CoolSystem AS cool_system',
            'wrl.DepositSecurity AS deposit_security',
            'wrl.Directions AS directions',
            'wrl.Exterior AS exterior',
            'wrl.Floors AS floor',
            'wrl.FrontDoorFaces AS front_door_faces',
            'wrl.HeatSystem AS heat_system',
            'wrl.Legal AS legal',
            'wrl.LotDesciption AS lot_type',
            'wrl.LotDimention AS lot_dimention',
            'wrl.LotSize AS lot_size',
            'wrl.MaintFeePaySchedule AS maint_fee_pay_schedule',
            'wrl.MaintFeeAmt AS maint_fee_amt',
            'wrl.NoOfGarageCap AS no_of_garage_cap',
            'wrl.PublicRemarks AS public_remarks',
            'wrl.SchoolElementary AS elementary_school',
            'wrl.SchoolHigh AS high_school',
            'wrl.SchoolMiddle AS middle_school',
            'wrl.TaxAmount AS tax_amount',
            'wrl.TaxRate AS tax_rate',
            'wrl.City AS city',
            'wrl.MasterPlannedCommunity AS masterplannedcommunity',
            'wrl.County AS county',
            'wrl.SchoolDistrict AS school_district',
            'wrl.GolfCourse AS golf_course',
            'CASE WHEN LOWER(COALESCE(wrl.PoolArea, "N")) = "n" THEN false ELSE true END AS neighborhood_pool',
            'CASE WHEN LOWER(COALESCE(wrl.PoolPrivate, "N")) = "n" THEN false ELSE true END AS private_pool',
            'CASE WHEN LOWER(COALESCE(wrl.Tennis, "N")) = "n" THEN false ELSE true END AS tennis_area',
            'CASE WHEN COALESCE(wrl.Furnished, "0") = "0" THEN false ELSE true END AS is_furnished',
            'wrl.GeoMarketArea AS geo_market_area',
            'wrl.Style AS style',
            'wrl.DwellingType AS dwelling_type',
            'wrl.DepositSecurity AS deposit',
        ];
    }

    async getAllProperties(
        {
            longitude,
            latitude,
            radius,
            beds_total,
            rooms_total,
            property_types,
            area,
            builder_names,
            city,
            zipcode,
            county,
            masterplannedcommunity,
            school_district,
            has_golf_course,
            has_neighborhood_pool_area,
            has_private_pool,
            has_tennis_area,
            is_furnished,
            max_price,
            min_price,
            page,
            limit,
            geo_market_area,
            style,
            dwelling_type,
        }: GetAllPropertiesDto,
        user: any,
    ): Promise<IGenericResult> {
        const qb = this.dataSource
            .createQueryBuilder()
            .select(this.getFrequentlySelectedPropertyFields())
            .from('wp_realty_listingsdb', 'wrl');

        if (latitude && longitude && radius) {
            qb.andWhere(
                'ST_Distance_Sphere(wrl.location_point, POINT(:longitude, :latitude)) <= :radius',
                { longitude, latitude, radius },
            );
        }

        // Validate and filter beds
        if (beds_total) {
            const bedsOptions = beds_total
                .split(',')
                .map((num) => parseInt(num.trim(), 10))
                .filter(Number.isFinite);
            if (bedsOptions.length > 0) {
                qb.andWhere('wrl.BedsTotal IN (:...bedsOptions)', {
                    bedsOptions,
                });
            }
        }

        if (rooms_total) {
            const roomsOptions = rooms_total
                .split(',')
                .map((num) => parseInt(num.trim(), 10))
                .filter(Number.isFinite);
            if (roomsOptions.length > 0) {
                qb.andWhere('wrl.RoomCount IN (:...roomsOptions)', {
                    roomsOptions,
                });
            }
        }

        // Validate and filter property types
        if (property_types) {
            const propertyTypesOptions = property_types
                .split(',')
                .map((el) => el.trim().toLowerCase())
                .filter(Boolean);
            if (propertyTypesOptions.length > 0) {
                qb.andWhere(
                    'LOWER(wrl.PropertyType) IN (:...propertyTypesOptions)',
                    { propertyTypesOptions },
                );
            }
        }

        // Validate and filter area
        if (area) {
            qb.andWhere(
                '(LOWER(wrl.listingsdb_title) LIKE TRIM(LOWER(:area)) OR LOWER(wrl.Address) LIKE TRIM(LOWER(:area)) OR LOWER(wrl.StreetName) LIKE TRIM(LOWER(:area)))',
                {
                    area,
                },
            );
        }

        // Validate and filter builder
        if (builder_names) {
            const builderNameOptions = builder_names
                .split(',')
                .map((el) => el.trim().toLowerCase());

            if (builderNameOptions.length > 0) {
                qb.andWhere(
                    'LOWER(wrl.BuilderName) IN (:...builderNameOptions)',
                    {
                        builderNameOptions,
                    },
                );
            }
        }

        if (city) {
            qb.andWhere('LOWER(wrl.City) = TRIM(LOWER(:city))', {
                city,
            });
        }

        if (zipcode) {
            qb.andWhere('LOWER(wrl.Zip) = TRIM(LOWER(:zipcode))', {
                zipcode,
            });
        }

        // validate county
        if (county) {
            qb.andWhere('LOWER(wrl.County) = TRIM(LOWER(:county))', { county });
        }

        if (masterplannedcommunity) {
            qb.andWhere(
                'LOWER(wrl.MasterPlannedCommunity) = TRIM(LOWER(:masterplannedcommunity))',
                { masterplannedcommunity },
            );
        }

        if (school_district) {
            qb.andWhere(
                'LOWER(wrl.SchoolDistrict) = TRIM(LOWER(:school_district))',
                {
                    school_district,
                },
            );
        }

        // validate if property has golf course
        if (has_golf_course?.toLowerCase() === 'true') {
            qb.andWhere('wrl.GolfCourse IS NOT NULL');
        } else if (has_golf_course?.toLowerCase() === 'false') {
            qb.andWhere('wrl.GolfCourse IS NULL');
        }

        // Validate pool area, or private pool
        if (has_neighborhood_pool_area?.toLowerCase() === 'true') {
            qb.andWhere(
                '(wrl.PoolArea IS NOT NULL AND LOWER(wrl.PoolArea) = "y")',
            );
        } else if (has_neighborhood_pool_area?.toLowerCase() === 'false') {
            qb.andWhere('(wrl.PoolArea IS NULL OR LOWER(wrl.PoolArea) = "n")');
        }

        if (has_private_pool?.toLowerCase() === 'true') {
            qb.andWhere(
                '(wrl.PoolPrivate IS NOT NULL AND LOWER(wrl.poolPrivate) = "y")',
            );
        } else if (has_private_pool?.toLowerCase() === 'false') {
            qb.andWhere(
                '(wrl.PoolPrivate IS NULL OR LOWER(wrl.poolPrivate) = "n")',
            );
        }

        // Validate tennis play area
        if (has_tennis_area?.toLowerCase() === 'true') {
            qb.andWhere('(wrl.Tennis IS NOT NULL AND LOWER(wrl.Tennis) = "y")');
        } else if (has_tennis_area?.toLowerCase() === 'false') {
            qb.andWhere('(wrl.Tennis IS NULL OR LOWER(wrl.Tennis) = "n")');
        }

        if (is_furnished?.toLowerCase() === 'true') {
            qb.andWhere('wrl.Furnished IS NOT NULL AND wrl.Furnished <> "0"');
        } else if (is_furnished?.toLowerCase() === 'false') {
            qb.andWhere('COALESCE(wrl.Furnished, "0") = "0"');
        }

        // filter between price
        if (max_price && min_price) {
            qb.andWhere('(wrl.Price > :min_price AND wrl.Price < :max_price)', {
                min_price: +min_price,
                max_price: +max_price,
            });
        }

        // filter geo market area
        if (geo_market_area) {
            qb.andWhere(
                '(LOWER(wrl.GeoMarketArea) LIKE TRIM(LOWER(:geo_market_area)))',
                { geo_market_area },
            );
        }

        // filter style of property
        if (style) {
            qb.andWhere('(LOWER(wrl.Style) LIKE TRIM(LOWER(:style)))', {
                style,
            });
        }

        // filter properties by dwelling type
        if (dwelling_type) {
            qb.andWhere(
                '(LOWER(wrl.DwellingType) LIKE TRIM(LOWER(:dwelling_type)))',
                {
                    dwelling_type,
                },
            );
        }

        page = parseInt(String(page), 10) || 1;
        limit = parseInt(String(limit), 10) || 100;

        const offset = (page - 1) * limit;

        qb.offset(offset).limit(limit ?? 100);

        let result = await qb.getRawMany();
        if (user) {
            const likedProperties: any[] = (await this.likedProperties(user))
                .data.likedProperties;
            result = result.map((property) => {
                if (
                    likedProperties.findIndex((el) => el.id === property.id) !==
                    -1
                ) {
                    return {
                        ...property,
                        is_liked: true,
                    };
                } else {
                    return {
                        ...property,
                        is_liked: false,
                    };
                }
            });
        }
        return {
            data: {
                properties: result,
                // metadata: {
                //     totalCount: totalCount[0]['count'],
                //     next: offset + limit < totalCount[0]['count'],
                //     totalPages: Math.ceil(totalCount[0]['count'] / limit),
                // },
            },
            message: 'Properties found',
        };
    }

    async getPropertyById(
        propertyId: number,
        userIp: string,
        user: any,
    ): Promise<IGenericResult> {
        let loginRequired: boolean = false;
        if (!user) {
            const visitCount = (
                await this.dataSource.query(
                    `
                    SELECT
                        pv.visitCount AS count
                    FROM
                        property_visits pv
                    WHERE
                        pv.ip = ?
                `,
                    [userIp],
                )
            )[0]?.count;
            if (visitCount > 2) {
                loginRequired = true;
            } else {
                await this.dataSource.query(
                    `
                            INSERT INTO property_visits (ip, visitCount)
                            VALUES (?, 1)
                            ON DUPLICATE KEY UPDATE visitCount = visitCount + 1
                        `,
                    [userIp],
                );
            }
        }
        const qb = this.dataSource
            .createQueryBuilder()
            .select(this.getFrequentlySelectedPropertyFields())
            .from('wp_realty_listingsdb', 'wrl')
            .where('wrl.listingsdb_id = :propertyId', { propertyId });

        const foundProperty = await qb.getRawOne();

        if (user) {
            const propertyLIke = await this.dataSource.query(
                `
                SELECT *
                FROM property_likes
                WHERE user_id = ?
                AND property_id = ?
                `,
                [user.userId, propertyId],
            );
            if (propertyLIke[0]) foundProperty['is_liked'] = true;
        }

        if (!foundProperty) {
            throw new NotFoundException(CONSTANTS.PROPERTY_NOT_FOUND);
        }

        const { data: walkScore } = await firstValueFrom(
            this.httpService
                .get(
                    `https://api.walkscore.com/score?format=json&lat=${foundProperty.latitude}5&lon=${foundProperty.latitude}&wsapikey=${this.configService.get('walkscore.apiKey')}`,
                )
                .pipe(
                    catchError((err: AxiosError) => {
                        throw err;
                    }),
                ),
        );

        if (walkScore.status === 1) foundProperty['walkscore'] = walkScore;

        return {
            data: {
                property: foundProperty,
                loginRequired,
            },
            message: 'Property found',
        };
    }

    /*
        TODO: IMPROVEMENTS
        - For sale column has all nulls so considered all homes for sale
    */
    async getPropertiesStateByZip(
        query: GetPropertiesStateByZip,
    ): Promise<IGenericResult> {
        // todo: may be original listing price is not actual price check for price,,, rent sell
        const result = await this.dataSource.query(
            `
            SELECT
                COALESCE(ROUND(AVG(wrl.OriginalListPrice), 2), 0) AS avg_price,            
                COALESCE(COUNT(*), 0 ) AS total_listings,
                COALESCE(ROUND(AVG(wrl.OriginalListPrice / wrl.SqFtTotal), 2), 0 ) AS avg_price_per_sqft,
                COALESCE(ROUND(AVG(DATEDIFF(CURDATE(), wrl.ActiveDate)), 2), 0 ) AS avg_active_days
            FROM
                my_database.wp_realty_listingsdb wrl
            WHERE
                wrl.Zip = ?;

            `,
            [query.zipcode],
        );

        return {
            data: {
                states: result,
            },
            message: 'Properties states',
        };
    }

    async like(propertyId: string, user: any): Promise<IGenericResult> {
        const userRes = await this.dataSource
            .createQueryBuilder()
            .select()
            .from(UsersEntity, 'u')
            .where('u.email = :email', { email: user.email })
            .getRawOne();
        let isLiked: boolean = false;
        if (userRes) {
            const foundProperty = await this.dataSource.query(
                `
                SELECT
                    *
                FROM
                    wp_realty_listingsdb wrl
                WHERE
                    wrl.listingsdb_id = ?
                `,
                [propertyId],
            );
            if (foundProperty[0]) {
                const foundPropertyLike = await this.dataSource.query(
                    `
                    SELECT
                        *
                    FROM
                        property_likes
                    WHERE user_id = ?
                    AND property_id = ?
                    `,
                    [userRes.id, propertyId],
                );
                if (foundPropertyLike[0]) {
                    // Unlike property
                    await this.dataSource.query(
                        `
                        DELETE FROM
                            property_likes
                        WHERE property_id = ?
                        AND user_id = ?
                        `,
                        [propertyId, userRes.id],
                    );
                } else {
                    // Like property
                    await this.dataSource
                        .createQueryBuilder()
                        .insert()
                        .into(PropertyLikesEntity)
                        .values({
                            user: userRes,
                            property_id: foundProperty[0]?.listingsdb_id,
                        })
                        .execute();
                    isLiked = true;
                }
                return {
                    message: 'ok',
                    data: {
                        isLiked,
                    },
                };
            } else {
                throw new NotFoundException(CONSTANTS.PROPERTY_NOT_FOUND);
            }
        } else {
            throw new UnauthorizedException();
        }
    }

    async likedProperties(user: any): Promise<IGenericResult> {
        const foundLikedProperties = await this.dataSource.query(
            `
            SELECT
	            ${this.getFrequentlySelectedPropertyFields()}
            FROM
	            wp_realty_listingsdb wrl
            JOIN property_likes pl
            ON pl.property_id = wrl.listingsdb_id
            JOIN users u
            ON u.id  = pl.user_id 
            WHERE pl.user_id  = ?;
            `,
            [user.userId],
        );
        return {
            message: 'Found liked properties',
            data: {
                likedProperties: foundLikedProperties,
            },
        };
    }
}
