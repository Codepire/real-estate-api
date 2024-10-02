import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsers1726420612131 implements MigrationInterface {
    name = 'UpdateUsers1726420612131';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD \`phone_number\` varchar(255) NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`users\` DROP COLUMN \`phone_number\``,
        );
    }
}
