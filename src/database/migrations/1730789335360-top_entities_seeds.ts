import { MigrationInterface, QueryRunner } from 'typeorm';

export class TopEntitiesSeeds1730789335360 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO top_entities (alias)
            VALUES ('top_builders'), ('top_associations'), ('top_cities')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM top_entities
            WHERE alias IN ('top_builders', 'top_associations', 'top_cities')
        `);
    }
}
