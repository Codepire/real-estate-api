import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsers1726419414998 implements MigrationInterface {
    name = 'UpdateUsers1726419414998';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`users\` CHANGE \`profile_url\` \`profile_url\` varchar(255) NOT NULL DEFAULT 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`users\` CHANGE \`profile_url\` \`profile_url\` varchar(255) NOT NULL`,
        );
    }
}
