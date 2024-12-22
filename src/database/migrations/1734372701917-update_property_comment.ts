import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePropertyComment1734372701917 implements MigrationInterface {
    name = 'UpdatePropertyComment1734372701917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`property_comment\` ADD \`phone_number\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`property_comment\` DROP COLUMN \`phone_number\``);
    }

}
