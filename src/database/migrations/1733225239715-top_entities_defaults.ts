import { MigrationInterface, QueryRunner } from "typeorm";

export class TopEntitiesDefaults1733225239715 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO top_entities (alias, entities)
            VALUES ('top_properties', '[]')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
