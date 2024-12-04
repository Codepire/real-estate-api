import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterWpListing1733244531123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE wp_realty_listingsdb
            ADD COLUMN property_images VARCHAR(255) NOT NULL DEFAULT '[]';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
