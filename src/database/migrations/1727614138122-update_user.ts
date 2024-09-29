import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1727614138122 implements MigrationInterface {
    name = 'UpdateUser1727614138122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`salt\` \`salt\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`salt\` \`salt\` varchar(255) NOT NULL`);
    }

}
