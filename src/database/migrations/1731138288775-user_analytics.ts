import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAnalytics1731138288775 implements MigrationInterface {
    name = 'UserAnalytics1731138288775';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`user_analytics\` (\`id\` int NOT NULL AUTO_INCREMENT, \`page\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` ADD CONSTRAINT \`FK_1b21a2704e98eb4ad610a671f2a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` DROP FOREIGN KEY \`FK_1b21a2704e98eb4ad610a671f2a\``,
        );
        await queryRunner.query(`DROP TABLE \`user_analytics\``);
    }
}
