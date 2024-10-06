import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IGenericResult } from './common/interfaces';

@Injectable()
export class AppService {
    constructor(private readonly dataSource: DataSource) {}
    getHello(): string {
        return 'Hello World!';
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
                countries: res?.map(
                    (el: { Country: string }) => el.Country ?? [],
                ),
            },
        };
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
                states: res?.map((el: { State: string }) => el.State) ?? [],
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
                cities: res?.map((el: { City: string }) => el.City) ?? [],
            },
        };
    }

    async getBuilders(): Promise<string[]> {
        const res = await this.dataSource.query(
            `
                SELECT DISTINCT (wrl.builderName)
                FROM my_database.wp_realty_listingsdb wrl
                WHERE wrl.BuilderName IS NOT NULL;
            `,
        );
        return res?.map((el: { builderName: string }) => el.builderName) ?? [];
    }

    async getMasterPlannedCommunities(): Promise<string[]> {
        const res = await this.dataSource.query(`
                SELECT DISTINCT (wrl.MasterPlannedCommunity)
                FROM my_database.wp_realty_listingsdb wrl
                WHERE wrl.MasterPlannedCommunity IS NOT NULL;
            `);

        return (
            res?.map(
                (el: { MasterPlannedCommunity: string }) =>
                    el.MasterPlannedCommunity,
            ) ?? []
        );
    }

    async getCounties(): Promise<IGenericResult> {
        const res = await this.dataSource.query(`
                SELECT DISTINCT (wrl.County)
                FROM my_database.wp_realty_listingsdb wrl
                WHERE wrl.County IS NOT NULL;
            `);

        return res?.map((el: { County: string }) => el.County) ?? [];
    }

    async getRoomCount(): Promise<IGenericResult> {
        const res = await this.dataSource.query(`
                SELECT DISTINCT (wrl.RoomCount)
                from wp_realty_listingsdb wrl
                WHERE wrl.RoomCount IS NOT NULL;
        `);
        return res?.map((el: { RoomCount: number }) => el.RoomCount) ?? [];
    }

    async getZipCods(): Promise<IGenericResult> {
        const res = await this.dataSource.query(`
            SELECT
                DISTINCT (wrl.Zip)
            FROM
                my_database.wp_realty_listingsdb wrl
            WHERE
                wrl.Zip IS NOT NULL;
        `);
        return {
            message: 'Zipcodes found',
            data: res?.map((el: { Zip: string }) => el.Zip) ?? [],
        };
    }
}
