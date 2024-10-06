import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IGenericResult } from './common/interfaces';

@Injectable()
export class AppService {
    constructor(private readonly dataSource: DataSource) { }
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
                    (el: { Country: string }) =>
                        String(el.Country).toLowerCase() ?? [],
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
                states:
                    res?.map((el: { State: string }) =>
                        String(el.State).toLowerCase(),
                    ) ?? [],
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
                cities:
                    res?.map((el: { City: string }) =>
                        String(el.City).toLowerCase(),
                    ) ?? [],
            },
        };
    }
}
