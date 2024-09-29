import { Injectable } from '@nestjs/common';
import { GetAllPropertiesDto } from './dto/get-all-properties.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class PropertiesService {
    constructor(private readonly dataSource: DataSource) {}

    async getAllProperties({
        longitude,
        latitude,
        radius,
        beads_total,
        property_types,
    }: GetAllPropertiesDto) {
        const qb = this.dataSource
            .createQueryBuilder()
            .select([
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
            ])
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

        const result = await qb.getRawMany();
        return result;
    }
}
