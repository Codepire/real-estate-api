import { MigrationInterface, QueryRunner } from 'typeorm';

export class IpStore1729421976284 implements MigrationInterface {
    name = 'IpStore1729421976284';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` ADD \`visitCount\` int NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` ADD UNIQUE INDEX \`IDX_9da34bc4aa2e5fc237b023690a\` (\`ip\`)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` DROP INDEX \`IDX_9da34bc4aa2e5fc237b023690a\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_visits\` DROP COLUMN \`visitCount\``,
        );
    }
}
