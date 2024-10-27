import { MigrationInterface, QueryRunner } from 'typeorm';

export class PropertyLikes1730047695571 implements MigrationInterface {
    name = 'PropertyLikes1730047695571';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`property_likes\` (\`id\` int NOT NULL, \`property_id\` varchar(255) NOT NULL, \`user_id\` int NULL, UNIQUE INDEX \`IDX_d4f499d1c46c5dfde6851e7b0e\` (\`user_id\`, \`property_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_likes\` ADD CONSTRAINT \`FK_ed25eeab5ca90d1574981b41d7d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`property_likes\` DROP FOREIGN KEY \`FK_ed25eeab5ca90d1574981b41d7d\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_d4f499d1c46c5dfde6851e7b0e\` ON \`property_likes\``,
        );
        await queryRunner.query(`DROP TABLE \`property_likes\``);
    }
}
