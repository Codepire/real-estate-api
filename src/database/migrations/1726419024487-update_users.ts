import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsers1726419024487 implements MigrationInterface {
    name = 'UpdateUsers1726419024487';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD \`salt\` varchar(255) NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`salt\``);
    }
}
