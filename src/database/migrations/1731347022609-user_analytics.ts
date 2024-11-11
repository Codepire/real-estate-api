import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAnalytics1731347022609 implements MigrationInterface {
    name = 'UserAnalytics1731347022609'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_analytics\` ADD \`session\` varchar(40) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_analytics\` DROP COLUMN \`session\``);
    }

}
