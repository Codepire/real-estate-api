import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { DataSource } from 'typeorm';
import { IGenericResult } from 'src/common/interfaces';
import { CONSTANTS } from 'src/common/constants';
import { GetPropertiesStateByZip } from './dto/get-properties-states.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { EventTypeEnum } from 'src/common/enums';

@Injectable()
export class PropertiesService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly analyticsService: AnalyticsService,
    ) {}

    // todo: true false not working, only 0 and 1 going
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
            'wrl.Description AS description',
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
            'wrl.CompletedConstructionDate as completed_construction_date',
            'wrl.CompletionDate as expected_completion_date',
            'wrl.DepositSecurity AS deposit',
            'CASE WHEN COALESCE(wrl.ForLease, "0") = "0" THEN false ELSE true END AS for_lease',
            'CASE WHEN COALESCE(wrl.ForSale, "0") = "0" THEN false ELSE true END AS for_sale',
            'wrl.property_images as property_images'
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
            property_sale_type,
            is_liked,
            searchText,
        }: GetAllPropertiesDto,
        user: any,
    ): Promise<IGenericResult> {
        const qb = this.dataSource
            .createQueryBuilder()
            .select([
                ...this.getFrequentlySelectedPropertyFields(),
                ...(user && user.role === 'admin' ? ['wrl.is_active'] : []),
            ])
            .from('wp_realty_listingsdb', 'wrl');

        if (user && user?.role !== 'admin') {
            qb.andWhere('wrl.is_active = 1');
        }

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

        if (property_sale_type) {
            const saleTypeOptions = String(property_sale_type).split(',');
            if (saleTypeOptions?.includes('sale')) {
                qb.andWhere('wrl.ForSale = 1');
            }
            if (saleTypeOptions?.includes('lease')) {
                qb.andWhere('wrl.ForLease = 1');
            }
        }

        if (searchText) {
            qb.andWhere(
                '(LOWER(wrl.listingsdb_title) LIKE TRIM(LOWER(:searchText)) OR LOWER(wrl.Address) LIKE TRIM(LOWER(:searchText)) OR LOWER(wrl.StreetName) LIKE TRIM(LOWER(:searchText)))',
                {
                    searchText: `%${searchText}%`,
                },
            );
        }

        // if logged in user requests the properties, attach if this property is liked or not
        if (user) {
            qb.leftJoin(
                'user_analytics',
                'ua',
                'ua.event = wrl.listingsdb_id AND ua.event_name = :event_name AND ua.user_id = :user_id',
            );

            qb.addSelect([
                'CASE WHEN ua.user_id = :user_id THEN true ELSE false END AS is_liked',
            ]);

            if (is_liked?.toLowerCase() === 'true') {
                qb.andWhere('ua.event_name = :event_name');
            }
            qb.setParameters({
                user_id: user.userId,
                event_name: EventTypeEnum.PROPERTY_LIKE,
            });
        }

        page = parseInt(String(page), 10) || 1;
        limit = parseInt(String(limit), 10) || 100;

        const offset = (page - 1) * limit;
        
        const aggregateQb = qb.clone().select('COUNT(*)', 'count')
        qb.offset(offset).limit(limit ?? 100);

        let [result, totalCount] = await Promise.all([qb.getRawMany(), aggregateQb.execute()]);

        return {
            data: {
                properties: result,
                metadata: {
                    totalCount: parseInt(totalCount[0]['count']) || 0,
                    next: offset + limit < totalCount[0]['count'],
                    totalPages: Math.ceil(totalCount[0]['count'] / limit),
                },
            },
            message: 'Properties found',
        };
    }

    async getPropertyById(
        propertyId: number,
        user: any,
        sessionId?: string,
    ): Promise<IGenericResult> {
        let loginRequired: boolean = false;

        if (!user) {
            const userView = await this.dataSource.query(
                `
                SELECT COUNT(*) AS view_count  FROM user_analytics ua WHERE session = ?;`,
                [sessionId],
            );
            if (userView && userView[0].view_count > 2) {
                loginRequired = true;
            }
        }

        if (user?.role !== 'admin') {
            await this.analyticsService.saveUserAnalytics(
                {
                    event_name: EventTypeEnum.PROPERTY_VIEW,
                    event: String(propertyId),
                },
                user,
                sessionId,
            );
        }

        const qb = this.dataSource
            .createQueryBuilder()
            .select(this.getFrequentlySelectedPropertyFields())
            .from('wp_realty_listingsdb', 'wrl')
            .where('wrl.listingsdb_id = :propertyId', { propertyId });

        const foundProperty = await qb.getRawOne();
        if (!foundProperty) {
            throw new NotFoundException(CONSTANTS.PROPERTY_NOT_FOUND);
        }

        const marketStatesByZip = await this.getPropertiesStateByZip({ zipcode: foundProperty.zipcode });

        foundProperty['market_states'] = marketStatesByZip.data.states[0];
        foundProperty['is_liked'] = false;

        if (user) {
            if (user.role !== 'admin') {
                qb.andWhere('wrl.is_active = 1');
            }
            const propertyLIke = await this.dataSource.query(
                `
                SELECT *
                FROM user_analytics
                WHERE (user_id = ? OR session = ?)
                AND event = ?
                AND event_name = ?;
                `,
                [
                    user.userId,
                    sessionId,
                    propertyId,
                    EventTypeEnum.PROPERTY_LIKE,
                ],
            );
            if (propertyLIke[0]) foundProperty['is_liked'] = true;
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
                wp_realty_listingsdb wrl
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

    async like(
        propertyId: string,
        user: any,
        sessionId: string,
    ): Promise<IGenericResult> {
        let isLiked: boolean = false;

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
                    FROM user_analytics
                        WHERE event = ?
                        AND event_name = ?
                        AND (user_id = ? OR session = ?);
                    `,
                [
                    propertyId,
                    EventTypeEnum.PROPERTY_LIKE,
                    user?.userId,
                    sessionId,
                ],
            );
            if (foundPropertyLike[0]) {
                // Unlike property
                await this.dataSource.query(
                    `
                        DELETE FROM
                            user_analytics ua
                        WHERE event = ?
                        AND event_name = ?
                        AND (user_id = ? OR session = ?);
                        `,
                    [
                        propertyId,
                        EventTypeEnum.PROPERTY_LIKE,
                        user?.userId,
                        sessionId,
                    ],
                );
            } else {
                // Like property
                await this.dataSource.query(
                    `
                    INSERT INTO user_analytics (user_id, event, event_name, session)
                    VALUES (?, ?, ?, ?);
                `,
                    [
                        user?.userId,
                        propertyId,
                        EventTypeEnum.PROPERTY_LIKE,
                        sessionId,
                    ],
                );
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
    }

    async likedProperties(userId: string): Promise<IGenericResult> {
        const foundLikedProperties = await this.dataSource.query(
            `
            SELECT
                ${this.getFrequentlySelectedPropertyFields()}
            FROM
                wp_realty_listingsdb wrl
            INNER JOIN user_analytics ua ON ua.event = wrl.listingsdb_id
            INNER JOIN users u ON u.id = ua.user_id 
            WHERE 
                ua.user_id = ?
                AND ua.event_name = ?
                AND wrl.is_active = 1;
            `,
            [userId, EventTypeEnum.PROPERTY_LIKE],
        );
        return {
            message: 'Found liked properties',
            data: {
                likedProperties: foundLikedProperties,
            },
        };
    }

    async activateDeactivatePropertyById(
        propertyId: number,
    ): Promise<IGenericResult> {
        const foundProperty = await this.dataSource.query(
            `
            SELECT
                is_active
            FROM
                wp_realty_listingsdb wrl
            WHERE
                wrl.listingsdb_id = ?
            `,
            [propertyId],
        );

        if (foundProperty[0]) {
            await this.dataSource.query(
                `
                UPDATE
                    wp_realty_listingsdb
                SET
                    is_active = ?
                WHERE
                    listingsdb_id = ?;
                `,
                [foundProperty[0].is_active ? 0 : 1, propertyId],
            );
        } else {
            throw new NotFoundException(CONSTANTS.PROPERTY_NOT_FOUND);
        }
        return {
            message: 'OK',
            data: {
                is_active: foundProperty[0].is_active ? false : true,
            },
        };
    }
}
