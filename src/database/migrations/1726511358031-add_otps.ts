import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtps1726511358031 implements MigrationInterface {
    name = 'AddOtps1726511358031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`otps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`otp\` varchar(255) NOT NULL, \`otp_type\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`otps\` ADD CONSTRAINT \`FK_82b0deb105275568cdcef2823eb\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`otps\` DROP FOREIGN KEY \`FK_82b0deb105275568cdcef2823eb\``);
        await queryRunner.query(`DROP TABLE \`otps\``);
    }

}
