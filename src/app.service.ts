import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IGenericResult } from './common/interfaces';

@Injectable()
export class AppService {
    constructor(private readonly dataSource: DataSource) {}
    healthcheck(): string {
        return `Service is up and running on ${new Date().toISOString()}`;
    }

    async getCountries(): Promise<IGenericResult> {
        const res = await this.dataSource.query(
            `
            SELECT DISTINCT(wrl.Country)
            FROM wp_realty_listingsdb wrl
            WHERE wrl.Country IS NOT NULL;
            `,
        );
        return {
            message: 'Countries found',
            data: {
                countries:
                    res?.map((el: { Country: string }) => el.Country)?.sort() ??
                    [],
            },
        };
    }

    async getPropertyTypes(): Promise<IGenericResult> {
        const res = await this.dataSource.query(
            `
                SELECT DISTINCT (wrl.PropertyType)
                FROM wp_realty_listingsdb wrl
                WHERE  wrl.PropertyType IS NOT NULL;
            `,
        );
        return (
            res
                ?.map((el: { PropertyType: string }) => el.PropertyType)
                ?.sort() ?? []
        );
    }

    async getStatesByCountry(country: string): Promise<IGenericResult> {
        const res = await this.dataSource.query(
            `
            SELECT DISTINCT (wrl.State)
            FROM wp_realty_listingsdb wrl
            WHERE LOWER(wrl.Country) = LOWER(?) AND wrl.State IS NOT NULL;
            `,
            [country],
        );
        return {
            message: 'States found',
            data: {
                states:
                    res?.map((el: { State: string }) => el.State)?.sort() ?? [],
            },
        };
    }

    async getCitiesByState(state: string): Promise<IGenericResult> {
        const res = await this.dataSource.query(
            `
            SELECT DISTINCT (wrl.City)
            FROM wp_realty_listingsdb wrl
            WHERE LOWER(wrl.State) = LOWER(?) AND wrl.City IS NOT NULL;
            `,
            [state],
        );
        return {
            message: 'Cities found',
            data: {
                cities:
                    res?.map((el: { City: string }) => el.City)?.sort() ?? [],
            },
        };
    }

    async getBuilders(): Promise<string[]> {
        const res = await this.dataSource.query(
            `
                SELECT DISTINCT (wrl.builderName)
                FROM wp_realty_listingsdb wrl
                WHERE wrl.BuilderName IS NOT NULL;
            `,
        );
        return (
            res?.map((el: { builderName: string }) => el.builderName)?.sort() ??
            []
        );
    }

    async getMasterPlannedCommunities(): Promise<string[]> {
        const res = await this.dataSource.query(`
                SELECT DISTINCT (wrl.MasterPlannedCommunity)
                FROM wp_realty_listingsdb wrl
                WHERE wrl.MasterPlannedCommunity IS NOT NULL;
            `);

        return (
            res
                ?.map(
                    (el: { MasterPlannedCommunity: string }) =>
                        el.MasterPlannedCommunity,
                )
                ?.sort() ?? []
        );
    }

    async getCounties(): Promise<string[]> {
        const res = await this.dataSource.query(`
                SELECT DISTINCT (wrl.County)
                FROM wp_realty_listingsdb wrl
                WHERE wrl.County IS NOT NULL;
            `);

        return res?.map((el: { County: string }) => el.County)?.sort() ?? [];
    }

    async getRoomCount(): Promise<number[]> {
        const res = await this.dataSource.query(`
                SELECT DISTINCT (wrl.RoomCount)
                from wp_realty_listingsdb wrl
                WHERE wrl.RoomCount IS NOT NULL;
        `);
        return (
            res
                ?.map((el: { RoomCount: number }) => el.RoomCount)
                ?.sort((a: number, b: number) => a - b) ?? []
        );
    }

    async getBedRoomCount(): Promise<number[]> {
        const res = await this.dataSource.query(`
            SELECT DISTINCT (wrl.BedsTotaL)
            FROM wp_realty_listingsdb wrl 
            WHERE wrl.BedsTotal IS NOT NULL;
    `);
        return (
            res
                ?.map((el: { BedsTotaL: number }) => el.BedsTotaL)
                ?.sort((a: number, b: number) => a - b) ?? []
        );
    }

    async getSchoolDistricts(): Promise<any[]> {
        const res = await this.dataSource.query(`
            SELECT 
                DISTINCT (wrl.SchoolDistrict)
            FROM
                wp_realty_listingsdb wrl 
            WHERE
                wrl.SchoolDistrict IS NOT NULL;
    `);
        return (
            res
                ?.map((el: { SchoolDistrict: string }) => el.SchoolDistrict)
                ?.sort() ?? []
        );
    }

    async getGeoMarketAreasByZip(zipcode: string) {
        const res = await this.dataSource.query(
            `
        SELECT
            DISTINCT(wrl.GeoMarketArea)
        FROM 
            wp_realty_listingsdb wrl
        WHERE 
            wrl.GeoMarketArea IS NOT NULL
        AND
            wrl.Zip = ?;
    `,
            [zipcode],
        );

        return {
            message: 'Geo market area found',
            data: {
                geo_market_areas:
                    res
                        ?.map(
                            (el: { GeoMarketArea: string }) => el.GeoMarketArea,
                        )
                        ?.sort() ?? [],
            },
        };
    }

    async getZipCodesByCity(city: string): Promise<IGenericResult> {
        const res = await this.dataSource.query(
            `
            SELECT
                DISTINCT (wrl.Zip)
            FROM
                wp_realty_listingsdb wrl
            WHERE
                wrl.Zip IS NOT NULL
            AND
                LOWER(wrl.City) = LOWER(?)
        `,
            [city],
        );
        return {
            message: 'Zipcodes found',
            data: res?.map((el: { Zip: string }) => el.Zip) ?? [],
        };
    }
}
