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
        return this.dataSource.query(
            `
                SELECT
                    alias,
                    entities
                FROM
                    top_entities;
            `,
        );
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
