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
            FROM wp_realty_listingsdb wrl;
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
            select DISTINCT (wrl.State)
            from wp_realty_listingsdb wrl
            where LOWER(wrl.Country) = LOWER(?);
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
            select DISTINCT (wrl.City)
            from wp_realty_listingsdb wrl
            where LOWER(wrl.State) = LOWER(?);
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

    async getBuilders(): Promise<IGenericResult> {
        const res = await this.dataSource.query(
            `
                SELECT DISTINCT (wrl.builderName)
                from my_database.wp_realty_listingsdb wrl
                WHERE wrl.BuilderName IS NOT NULL;
            `,
        );
        return {
            message: 'Builders found',
            data: {
                builders: res?.map(
                    (el: { builderName: string }) => el.builderName ?? [],
                ),
            },
        };
    }

    async getMasterPlannedCommunities(): Promise<IGenericResult> {
        const res = await this.dataSource.query(`
                SELECT DISTINCT (wrl.MasterPlannedCommunity)
                FROM my_database.wp_realty_listingsdb wrl
                WHERE wrl.MasterPlannedCommunity IS NOT NULL;
            `);

        return {
            message: 'Master planned communities found',
            data: {
                master_planned_communities:
                    res?.map(
                        (el: { MasterPlannedCommunity: string }) =>
                            el.MasterPlannedCommunity,
                    ) ?? [],
            },
        };
    }
}
