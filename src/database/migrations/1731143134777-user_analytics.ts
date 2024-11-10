import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAnalytics1731143134777 implements MigrationInterface {
    name = 'UserAnalytics1731143134777';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` CHANGE \`event_name\` \`event_name\` enum ('page_view', 'property_view') NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` CHANGE \`event_name\` \`event_name\` enum ('page_view') NOT NULL`,
        );
    }
}
