import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteTablePropertyView1731348181588 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`property_visits\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
