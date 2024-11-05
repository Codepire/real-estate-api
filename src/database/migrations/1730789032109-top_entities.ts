import { MigrationInterface, QueryRunner } from 'typeorm';

export class TopEntities1730789032109 implements MigrationInterface {
    name = 'TopEntities1730789032109';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`top_entities\` (\`id\` int NOT NULL AUTO_INCREMENT, \`alias\` varchar(255) NOT NULL, \`entities\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_39e80e4855af2140fe606fc4cf\` (\`alias\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX \`IDX_39e80e4855af2140fe606fc4cf\` ON \`top_entities\``,
        );
        await queryRunner.query(`DROP TABLE \`top_entities\``);
    }
}
