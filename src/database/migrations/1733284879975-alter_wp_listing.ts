import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterWpListing1733284879975 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE wp_realty_listingsdb
            MODIFY COLUMN property_images VARCHAR(5000) NOT NULL DEFAULT '[]';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
