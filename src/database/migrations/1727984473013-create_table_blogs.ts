import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableBlogs1727984473013 implements MigrationInterface {
    name = 'CreateTableBlogs1727984473013';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`blogs\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`title\` varchar(100) NOT NULL, \`body\` varchar(1000) NOT NULL, \`thumbnail_url\` varchar(200) NOT NULL, \`tag\` varchar(20) NOT NULL, UNIQUE INDEX \`IDX_cf769f6545fecaa29c2f3a3c31\` (\`thumbnail_url\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX \`IDX_cf769f6545fecaa29c2f3a3c31\` ON \`blogs\``,
        );
        await queryRunner.query(`DROP TABLE \`blogs\``);
    }
}
