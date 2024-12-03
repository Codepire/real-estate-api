import { MigrationInterface, QueryRunner } from "typeorm";

export class TopEntitiesDefaults1733208998342 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE top_entities 
            set entities = '[]';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
