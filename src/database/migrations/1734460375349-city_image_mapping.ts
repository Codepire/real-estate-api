import { MigrationInterface, QueryRunner } from "typeorm";

export class CityImageMapping1734460375349 implements MigrationInterface {
    name = 'CityImageMapping1734460375349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`city_image_mapping\` (\`city\` varchar(255) NOT NULL, \`imageUrl\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_9b42625dbc0ba868e22a301d77\` (\`imageUrl\`), PRIMARY KEY (\`city\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_9b42625dbc0ba868e22a301d77\` ON \`city_image_mapping\``);
        await queryRunner.query(`DROP TABLE \`city_image_mapping\``);
    }

}
