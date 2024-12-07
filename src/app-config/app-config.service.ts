import { BadRequestException, Injectable } from '@nestjs/common';
import { CONSTANTS } from 'src/common/constants';
import { DataSource } from 'typeorm';
import { IGenericResult } from 'src/common/interfaces';
import { QueryFiltersDto } from './dto/get-data-with-filters.dto';
import { AddTopAssociationsDto } from './dto/add-top-associations.dto';
import * as fs from 'node:fs';

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
            top_properties: [],
        };

        for (const el of res) {
            const entities = el.entities;
            if (!el.entities || el.entities?.length < 1) {
                continue;
            }
            if (el.alias === 'top_builders') {
                const result = await this.dataSource.query(
                    `
                    SELECT
                        BuilderName AS name,
                        SUM(CASE WHEN CompletedConstructionDate IS NULL THEN 1 ELSE 0 END) AS under_construction_projects,
                        SUM(CASE WHEN CompletedConstructionDate IS NOT NULL THEN 1 ELSE 0 END) AS completed_projects
                    FROM wp_realty_listingsdb
                    WHERE BuilderName IN (${entities.map((e) => '?')})
                    GROUP BY BuilderName;
                `,
                    [...entities],
                );

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
                const result = await this.dataSource.query(
                    `
                    SELECT
                        City AS name,
                        SUM(CASE WHEN CompletedConstructionDate IS NULL THEN 1 ELSE 0 END) AS under_construction_projects,
                        SUM(CASE WHEN CompletedConstructionDate IS NOT NULL THEN 1 ELSE 0 END) AS completed_projects
                    FROM wp_realty_listingsdb
                    WHERE City IN (${entities.map((e) => '?')})
                    GROUP BY City;
                `,
                    [...entities],
                );

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
            } else if (el.alias === 'top_associations') {
                response.top_associations =
                    (await this.getTopAssociations()).data?.top_associations ||
                    [];
            } else if (el.alias === 'top_properties') {
                const foundPropertiesRes = await this.dataSource.query(
                    `
                    SELECT
                      wrl.listingsdb_id AS id,
                      wrl.property_images as property_images,
                      wrl.listingsdb_title AS title,
                      wrl.Address AS address,
                      wrl.OriginalListPrice AS price,
                      wrl.BuilderName AS builder_name,
                      wrl.BedsTotal AS beds_total,
                      wrl.BathsFull AS baths_full,
                      wrl.SqFtTotal AS sqft_total,
                      wrl.City AS city,
                      wrl.State AS state,
                      wrl.Country AS country,
                      CASE WHEN COALESCE(wrl.ForLease, "0") = "0" THEN false ELSE true END AS for_lease,
                      CASE WHEN COALESCE(wrl.ForSale, "0") = "0" THEN false ELSE true END AS for_sale,
                      wrl.NoOfGarageCap AS no_of_garage_cap
                    FROM
                        wp_realty_listingsdb wrl
                    WHERE
                        wrl.listingsdb_id IN (${entities.map((e) => '?')})
                    `,
                    [...entities],
                );
                response.top_properties = foundPropertiesRes || [];
            }
        }
        return response;
    }

    async addOrRemoveTopEntity(
        entity: string,
        alias: string,
    ): Promise<IGenericResult> {
        const currentEntitiesResult = await this.dataSource.query(
            `SELECT entities FROM top_entities WHERE alias = ?`,
            [alias],
        );
        const currentEntities = currentEntitiesResult[0]?.entities || [];

        const entityIndex = currentEntities.indexOf(entity);
        if (entityIndex === -1) {
            if (
                (currentEntities.length >= 6 && alias === 'top_builders') ||
                (currentEntities.length >= 4 && alias === 'top_properties') ||
                (currentEntities.length >= 5 && alias === 'top_cities')
            ) {
                throw new BadRequestException(CONSTANTS.MAX_TOP_ENTITIES);
            }
            currentEntities.push(entity);
        } else {
            currentEntities.splice(entityIndex, 1);
        }

        await this.dataSource.query(
            `UPDATE top_entities SET entities = ? WHERE alias = ?`,
            [JSON.stringify(currentEntities), alias],
        );

        return {
            message: 'Association data updated',
        };
    }

    async getTopProperties(): Promise<IGenericResult> {
        const result = await this.dataSource.query(
            `
            SELECT
                entities
            FROM
                top_entities
            WHERE
                alias = 'top_properties'
            `,
        );

        return {
            message: 'Found top properties',
            data: {
                top_properties: result[0]?.entities ?? [],
            },
        };
    }

    /**
     *
     * @name getTopCities
     * @description returns all distinct cities from properties database with some analytics of city
     */
    async getTopCities({
        limit,
        page,
        searchText,
    }: QueryFiltersDto): Promise<IGenericResult> {
        const pageInt = parseInt(page) || 1;
        const limitInt = parseInt(limit) || 50;
        const offset = (pageInt - 1) * limitInt;
        const searchLowerText = searchText?.toLowerCase()?.trim() || '';

        let [foundCities, totalCount, topEntities] = await Promise.all([
            this.dataSource.query(
                `
                SELECT
                    city,
                    SUM(CASE WHEN wrl.CompletedConstructionDate IS NULL THEN 1 ELSE 0 END) AS under_construction_projects,
                    SUM(CASE WHEN wrl.CompletedConstructionDate IS NOT NULL THEN 1 ELSE 0 END) AS completed_projects,
                    COUNT(wrl.listingsdb_id) AS total_projects,
                    SUM(CASE WHEN ua.event_name = 'property_like' THEN 1 ELSE 0 END) AS likes,
                    SUM(CASE WHEN ua.event_name = 'property_view' THEN 1 ELSE 0 END) AS views
                FROM
                    wp_realty_listingsdb wrl

                LEFT JOIN
                    user_analytics ua
                ON
                    (wrl.listingsdb_id = ua.event AND (ua.event_name = 'property_like' OR ua.event_name = 'property_view'))

                WHERE
                    City IS NOT NULL
                AND
                    LOWER(wrl.City) LIKE ?
                GROUP BY wrl.City
                ORDER BY
                    wrl.City ASC
                LIMIT ? OFFSET ?;
                `,
                [`%${searchLowerText}%`, limitInt, offset],
            ),
            this.dataSource.query(
                `
                SELECT COUNT(DISTINCT City) AS count
                    FROM wp_realty_listingsdb
                WHERE
                    City IS NOT NULL
                AND
                    LOWER(City) LIKE ?
                `,
                [`%${searchLowerText}%`, limitInt, offset],
            ),
            this.dataSource.query(
                `
                SELECT
                    entities
                FROM
                    top_entities
                WHERE alias = 'top_cities'
                `,
            ),
        ]);

        const entities: string[] = topEntities[0]?.entities || [];

        for (let i = 0; i < foundCities.length; i++) {
            if (entities.includes(foundCities[i].city)) {
                foundCities[i].is_top_entity = true;
            } else {
                foundCities[i].is_top_entity = false;
            }
        }

        return {
            message: 'Cities found',
            data: {
                cities: foundCities,
                metadata: {
                    totalCount: parseInt(totalCount[0]['count']) || 0,
                    next: offset + limitInt < totalCount[0]['count'],
                    totalPages: Math.ceil(totalCount[0]['count'] / limitInt),
                    totalTopCities: entities?.length || 0,
                },
            },
        };
    }

    /**
     *
     * @name getTopBuilders
     * @description returns all distinct builders from properties database with some analytics of builder
     */
    async getTopBuilders({
        limit,
        page,
        searchText,
    }: QueryFiltersDto): Promise<IGenericResult> {
        const pageInt = parseInt(page) || 1;
        const limitInt = parseInt(limit) || 50;
        const offset = (pageInt - 1) * limitInt;
        const searchLowerText = searchText?.toLowerCase()?.trim() || '';

        let [foundBuilders, totalCount, topEntities] = await Promise.all([
            this.dataSource.query(
                `
                SELECT
                    BuilderName as builder_name,
                    SUM(CASE WHEN wrl.CompletedConstructionDate IS NULL THEN 1 ELSE 0 END) AS under_construction_projects,
                    SUM(CASE WHEN wrl.CompletedConstructionDate IS NOT NULL THEN 1 ELSE 0 END) AS completed_projects,
                    COUNT(wrl.listingsdb_id) AS total_projects,
                    SUM(CASE WHEN ua.event_name = 'property_like' THEN 1 ELSE 0 END) AS likes,
                    SUM(CASE WHEN ua.event_name = 'property_view' THEN 1 ELSE 0 END) AS views
                FROM
                    wp_realty_listingsdb wrl

                LEFT JOIN
                    user_analytics ua
                ON
                    (wrl.listingsdb_id = ua.event AND (ua.event_name = 'property_like' OR ua.event_name = 'property_view'))

                WHERE
                    BuilderName IS NOT NULL
                AND
                    LOWER(wrl.BuilderName) LIKE ?
                GROUP BY wrl.BuilderName
                ORDER BY
                    wrl.BuilderName ASC
                LIMIT ? OFFSET ?;
                `,
                [`%${searchLowerText}%`, limitInt, offset],
            ),
            this.dataSource.query(
                `
                SELECT COUNT(DISTINCT BuilderName) AS count
                    FROM wp_realty_listingsdb
                WHERE
                    BuilderName IS NOT NULL
                AND
                    LOWER(BuilderName) LIKE ?
                `,
                [`%${searchLowerText}%`, limitInt, offset],
            ),
            this.dataSource.query(
                `
                SELECT
                    entities
                FROM
                    top_entities
                WHERE alias = 'top_builders'
                `,
            ),
        ]);

        const entities: string[] = topEntities[0]?.entities || [];

        for (let i = 0; i < foundBuilders.length; i++) {
            if (entities.includes(foundBuilders[i].builder_name)) {
                foundBuilders[i].is_top_entity = true;
            } else {
                foundBuilders[i].is_top_entity = false;
            }
        }

        return {
            message: 'Builders found',
            data: {
                builders: foundBuilders,
                metadata: {
                    totalCount: parseInt(totalCount[0]['count']) || 0,
                    next: offset + limitInt < totalCount[0]['count'],
                    totalPages: Math.ceil(totalCount[0]['count'] / limitInt),
                    totalTopBuilders: entities?.length || 0,
                },
            },
        };
    }

    async addTopAssociation(
        { association_name, association_url }: AddTopAssociationsDto,
        file: Express.Multer.File,
    ): Promise<IGenericResult> {
        const foundAssociations = await this.dataSource.query(
            `
                SELECT entities FROM top_entities WHERE alias = 'top_associations';
            `,
        );

        if (foundAssociations[0]?.entities?.length > 4) {
            throw new BadRequestException(CONSTANTS.MAX_TOP_ENTITIES);
        }

        const foundIndex = foundAssociations[0]?.entities?.findIndex(
            (el: { association_name: string; association_img_url: string }) =>
                el.association_name === association_name,
        );

        if (foundIndex !== -1 || !!!foundIndex) {
            throw new BadRequestException(CONSTANTS.ASSOCIATION_ALREADY_EXIST);
        }

        await this.dataSource.query(
            `
                UPDATE top_entities
                SET entities = JSON_ARRAY_APPEND(entities, '$', JSON_OBJECT('association_name', ?, 'association_url', ?, 'association_img_url', ?))
                WHERE alias = ?;
            `,
            [association_name, association_url, file.path, 'top_associations'],
        );

        return {
            message: 'Association data',
        };
    }

    async getTopAssociations(): Promise<IGenericResult> {
        const result = await this.dataSource.query(
            `
                SELECT * FROM top_entities
                WHERE alias = 'top_associations'
            `,
        );
        return {
            message: 'Found top associations',
            data: {
                top_associations: result[0]?.entities ?? [],
            },
        };
    }

    async deleteTopAssociation(
        association_name: string,
    ): Promise<IGenericResult> {
        const result = (
            await this.dataSource.query(
                `
            SELECT * FROM top_entities WHERE alias = 'top_associations'
        `,
            )
        )[0];

        const foundAssociation = result?.entities?.find(
            (el) => el.association_name === association_name,
        );

        if (fs.existsSync(foundAssociation?.association_img_url)) {
            fs.unlink(foundAssociation?.association_img_url, (err) => {
                if (err)
                    console.error(
                        'error in deleting this file',
                        foundAssociation?.association_img_url,
                    );
            });
        }

        const filteredAssociatin = result?.entities?.filter(
            (el) => el.association_name !== association_name,
        );

        await this.dataSource.query(
            `
            UPDATE top_entities
            SET entities = ?
            WHERE alias = 'top_associations'
        `,
            [JSON.stringify(filteredAssociatin)],
        );

        return {
            message: 'Association deleted',
        };
    }
}
