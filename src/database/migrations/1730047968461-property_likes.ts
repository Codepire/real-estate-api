import { MigrationInterface, QueryRunner } from 'typeorm';

export class PropertyLikes1730047968461 implements MigrationInterface {
    name = 'PropertyLikes1730047968461';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`property_likes\` DROP PRIMARY KEY`,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_likes\` DROP COLUMN \`id\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_likes\` ADD \`id\` int NOT NULL PRIMARY KEY`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`property_likes\` DROP COLUMN \`id\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_likes\` ADD \`id\` int NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`property_likes\` ADD PRIMARY KEY (\`id\`)`,
        );
    }
}
