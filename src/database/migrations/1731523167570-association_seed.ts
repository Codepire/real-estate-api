import { MigrationInterface, QueryRunner } from "typeorm";

export class AssociationSeed1731523167570 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO top_entities (alias)
            VALUES ('top_builders'), ('top_associations'), ('top_cities')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
