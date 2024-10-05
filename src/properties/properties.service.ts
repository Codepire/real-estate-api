import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { DataSource } from 'typeorm';
import { IGenericResult } from 'src/common/interfaces';
import { CONSTANTS } from 'src/common/constants';
import { GetPropertiesStateByZip } from './dto/get-properties-states.dto';

@Injectable()
export class PropertiesService {
    constructor(private readonly dataSource: DataSource) { }

    private getFrequentlySelectedPropertyFields(): string[] {
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
            'wrl.Furnished AS furnished',
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
            'wrl.SchoolDistrict AS district_school',
            'wrl.SchoolElementary AS elementary_school',
            'wrl.SchoolHigh AS high_school',
            'wrl.SchoolMiddle AS middle_school',
            'wrl.TaxAmount AS tax_amount',
            'wrl.TaxRate AS tax_rate',
            'wrl.BuilderName AS builder_name',
        ];
    }

    async getAllProperties({
        longitude,
        latitude,
        radius,
        beads_total,
        property_types,
        area,
        builder_name,
    }: GetAllPropertiesDto): Promise<IGenericResult> {
        const qb = this.dataSource
            .createQueryBuilder()
            .select(this.getFrequentlySelectedPropertyFields())
            .from('wp_realty_listingsdb', 'wrl')
            .where(
                'ST_Distance_Sphere(point(wrl.longitude, wrl.latitude), point(:longitude, :latitude)) <= :radius',
                { longitude, latitude, radius },
            );

        // Validate and filter beds
        if (beads_total) {
            const bedsOptions = beads_total
                .split(',')
                .map((num) => parseInt(num.trim(), 10))
                .filter(Number.isFinite);
            if (bedsOptions.length) {
                qb.andWhere('wrl.BedsTotal IN (:...bedsOptions)', {
                    bedsOptions,
                });
            }
        }

        // Validate and filter property types
        if (property_types) {
            const propertyTypesOptions = property_types
                .split(',')
                .map((el) => el.trim().toLowerCase())
                .filter(Boolean);
            if (propertyTypesOptions.length) {
                qb.andWhere(
                    'LOWER(wrl.PropertyType) IN (:...propertyTypesOptions)',
                    { propertyTypesOptions },
                );
            }
        }

        // Validate and filter area
        if (area) {
            qb.andWhere(
                '(LOWER(wrl.listingsdb_title) LIKE :area OR LOWER(wrl.Address) LIKE :area OR LOWER(wrl.StreetName) LIKE :area)',
                {
                    area: `%${area.toLowerCase()}%`, // Add wildcards
                },
            );
        }

        // Validate and filter builder
        if (builder_name) {
            console.log('came in builder name', builder_name);
            qb.andWhere('LOWER(wrl.BuilderName) LIKE :builder_name', {
                builder_name: `%${builder_name.toLowerCase()}%`, // Add wildcards
            });
        }

        const result = await qb.getRawMany();
        return {
            data: {
                properties: result,
            },
            message: 'Properties found',
        };
    }

    async getPropertyById(propertyId: number): Promise<IGenericResult> {
        const qb = this.dataSource
            .createQueryBuilder()
            .select(this.getFrequentlySelectedPropertyFields())
            .from('wp_realty_listingsdb', 'wrl')
            .where('wrl.listingsdb_id = :propertyId', { propertyId });

        const result = await qb.getRawOne();

        if (!result) {
            throw new NotFoundException(CONSTANTS.PROPERTY_NOT_FOUND);
        }

        return {
            data: {
                property: result,
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
}
