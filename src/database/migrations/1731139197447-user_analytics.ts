import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAnalytics1731139197447 implements MigrationInterface {
    name = 'UserAnalytics1731139197447';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` DROP COLUMN \`page\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` ADD \`event_name\` enum ('page_view') NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` ADD \`event\` varchar(255) NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` DROP COLUMN \`event\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` DROP COLUMN \`event_name\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` ADD \`page\` varchar(255) NOT NULL`,
        );
    }
}
