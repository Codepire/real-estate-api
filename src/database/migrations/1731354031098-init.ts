import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1731354031098 implements MigrationInterface {
    name = 'Init1731354031098';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`otps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`otp\` varchar(255) NOT NULL, \`otp_type\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`user_analytics\` (\`id\` int NOT NULL AUTO_INCREMENT, \`event_name\` enum ('page_view', 'property_view', 'property_like') NOT NULL, \`event\` varchar(255) NOT NULL, \`session\` varchar(40) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`users\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`profile_url\` varchar(255) NOT NULL DEFAULT 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', \`password\` varchar(255) NULL, \`salt\` varchar(255) NULL, \`phone_number\` varchar(255) NULL, \`is_verified_email\` tinyint NOT NULL DEFAULT 0, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`top_entities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`alias\` varchar(255) NOT NULL, \`entities\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_39e80e4855af2140fe606fc4cf\` (\`alias\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`blogs\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`title\` varchar(100) NOT NULL, \`body\` varchar(1000) NOT NULL, \`thumbnail_url\` varchar(200) NOT NULL, \`tag\` varchar(20) NOT NULL, UNIQUE INDEX \`IDX_cf769f6545fecaa29c2f3a3c31\` (\`thumbnail_url\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`otps\` ADD CONSTRAINT \`FK_82b0deb105275568cdcef2823eb\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` ADD CONSTRAINT \`FK_1b21a2704e98eb4ad610a671f2a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`user_analytics\` DROP FOREIGN KEY \`FK_1b21a2704e98eb4ad610a671f2a\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`otps\` DROP FOREIGN KEY \`FK_82b0deb105275568cdcef2823eb\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_cf769f6545fecaa29c2f3a3c31\` ON \`blogs\``,
        );
        await queryRunner.query(`DROP TABLE \`blogs\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_39e80e4855af2140fe606fc4cf\` ON \`top_entities\``,
        );
        await queryRunner.query(`DROP TABLE \`top_entities\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
        );
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`user_analytics\``);
        await queryRunner.query(`DROP TABLE \`otps\``);
    }
}
