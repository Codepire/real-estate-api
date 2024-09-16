import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteOtpEntity1726511508699 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`otp_entity\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
