import { MigrationInterface, QueryRunner } from 'typeorm';

export class IpStore1729421247732 implements MigrationInterface {
    name = 'IpStore1729421247732';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`property_visits\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ip\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`property_visits\``);
    }
}
