import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CONSTANTS } from 'src/common/constants';
import { DataSource } from 'typeorm';
import { IGenericResult } from 'src/common/interfaces';

@Injectable()
export class HomeDataService {
    constructor(private readonly dataSource: DataSource) {}
    async getTopEntities() {
        const res = await this.dataSource.query(`
            SELECT alias, entities FROM top_entities;
        `);

        const response = {
            top_builders: [],
            top_cities: [],
            top_associations: [],
        };

        for (const el of res) {
            const entities = el.entities?.slice(0, 5);
            if (!el.entities[0]) {
                continue;
            }
            if (el.alias === 'top_builders') {
                const builderNames = entities
                    .map((entity: string) => `'${entity}'`)
                    .join(',');
                const result = await this.dataSource.query(`
                    SELECT
                        BuilderName AS name,
                        SUM(CASE WHEN CompletedConstructionDate IS NULL THEN 1 ELSE 0 END) AS under_construction_projects,
                        SUM(CASE WHEN CompletedConstructionDate IS NOT NULL THEN 1 ELSE 0 END) AS completed_projects
                    FROM wp_realty_listingsdb
                    WHERE BuilderName IN (${builderNames})
                    GROUP BY BuilderName;
                `);

                for (const el of result) {
                    response.top_builders.push({
                        builder_name: el.name,
                        under_construction_projects:
                            +el.under_construction_projects,
                        completed_projects: +el.completed_projects,
                        total_projects:
                            +el.under_construction_projects +
                            +el.completed_projects,
                    });
                }
            } else if (el.alias === 'top_cities') {
                const cityNames = entities
                    .map((entity: string) => `'${entity}'`)
                    .join(',');
                const result = await this.dataSource.query(`
                    SELECT
                        City AS name,
                        SUM(CASE WHEN CompletedConstructionDate IS NULL THEN 1 ELSE 0 END) AS under_construction_projects,
                        SUM(CASE WHEN CompletedConstructionDate IS NOT NULL THEN 1 ELSE 0 END) AS completed_projects
                    FROM wp_realty_listingsdb
                    WHERE City IN (${cityNames})
                    GROUP BY City;
                `);

                for (const el of result) {
                    response.top_cities.push({
                        city_name: el.name,
                        under_construction_projects:
                            +el.under_construction_projects,
                        completed_projects: +el.completed_projects,
                        total_projects:
                            +el.under_construction_projects +
                            +el.completed_projects,
                    });
                }
            }
        }
        return response;
    }

    async addTopEntity(
        newEntity: string,
        alias: string,
    ): Promise<IGenericResult> {
        const currentEntitiesResult = await this.dataSource.query(
            `SELECT entities FROM top_entities WHERE alias = ?`,
            [alias],
        );
        const currentEntities = currentEntitiesResult[0]?.entities || [];

        if (currentEntities.length >= 5) {
            throw new BadRequestException(CONSTANTS.MAX_TOP_ENTITIES);
        }
        if (currentEntities.includes(newEntity)) {
            throw new ConflictException(CONSTANTS.ENTITITY_ALREADY_EXISTS);
        }

        currentEntities.push(newEntity);

        await this.dataSource.query(
            `UPDATE top_entities SET entities = ? WHERE alias = ?`,
            [JSON.stringify(currentEntities), alias],
        );

        return {
            message: 'Entity added',
        };
    }
    async removeTopEntity(
        entityToRemove: string,
        alias: string,
    ): Promise<IGenericResult> {
        const currentEntitiesResult = await this.dataSource.query(
            `SELECT entities FROM top_entities WHERE alias = ?`,
            [alias],
        );
        const currentEntities = currentEntitiesResult[0]?.entities || [];

        const entityIndex = currentEntities.indexOf(entityToRemove);
        if (entityIndex === -1) {
            throw new NotFoundException('Entity not found in the list');
        }

        currentEntities.splice(entityIndex, 1);

        await this.dataSource.query(
            `UPDATE top_entities SET entities = ? WHERE alias = ?`,
            [JSON.stringify(currentEntities), alias],
        );

        return {
            message: 'Entity removed',
        };
    }
}
