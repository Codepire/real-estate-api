import { MigrationInterface, QueryRunner } from "typeorm";

export class Comment1733761919873 implements MigrationInterface {
    name = 'Comment1733761919873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`property_comment\` ADD \`isRead\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`property_comment\` DROP COLUMN \`isRead\``);
    }

}
