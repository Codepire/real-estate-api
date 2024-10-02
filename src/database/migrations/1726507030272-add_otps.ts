import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtps1726507030272 implements MigrationInterface {
    name = 'AddOtps1726507030272';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`otp_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`otp\` varchar(255) NOT NULL, \`otp_type\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD \`is_verified_email\` tinyint NOT NULL DEFAULT 0`,
        );
        await queryRunner.query(
            `ALTER TABLE \`otp_entity\` ADD CONSTRAINT \`FK_d8d7d1cd42eafbb1d6c61b2ff37\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`otp_entity\` DROP FOREIGN KEY \`FK_d8d7d1cd42eafbb1d6c61b2ff37\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` DROP COLUMN \`is_verified_email\``,
        );
        await queryRunner.query(`DROP TABLE \`otp_entity\``);
    }
}
