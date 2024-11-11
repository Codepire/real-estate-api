import { MigrationInterface, QueryRunner } from "typeorm";

export class EnumChange1731353115918 implements MigrationInterface {
    name = 'EnumChange1731353115918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_analytics\` CHANGE \`event_name\` \`event_name\` enum ('page_view', 'property_view', 'property_like') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_analytics\` CHANGE \`event_name\` \`event_name\` enum ('page_view', 'property_view') NOT NULL`);
    }

}
