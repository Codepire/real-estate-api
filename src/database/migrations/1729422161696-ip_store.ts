import { MigrationInterface, QueryRunner } from 'typeorm';

export class IpStore1729422161696 implements MigrationInterface {
    name = 'IpStore1729422161696';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` ADD \`deleted_at\` timestamp(6) NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` DROP COLUMN \`deleted_at\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` DROP COLUMN \`updated_at\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` DROP COLUMN \`created_at\``,
        );
    }
}
