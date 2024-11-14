import { MigrationInterface, QueryRunner } from "typeorm";

export class PropertyDeleted1731602767661 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE wp_realty_listingsdb
            ADD COLUMN is_active boolean NOT NULL DEFAULT true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
