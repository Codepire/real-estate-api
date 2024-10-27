import { MigrationInterface, QueryRunner } from 'typeorm';

export class nno_db_fk1730034880822 implements MigrationInterface {
    name = 'nno_db_fk1730034880822';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Modify property_id to INT
        await queryRunner.query(
            `ALTER TABLE property_likes MODIFY property_id INT`,
        );

        // Change the storage engine of wp_realty_listingsdb to InnoDB
        await queryRunner.query(
            `ALTER TABLE wp_realty_listingsdb ENGINE=InnoDB`,
        );

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE property_likes 
            ADD CONSTRAINT FK_ed25eeab5ca90d157498123424 
            FOREIGN KEY (property_id) 
            REFERENCES wp_realty_listingsdb (listingsdb_id) 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint if it exists
        await queryRunner.query(
            `ALTER TABLE property_likes DROP FOREIGN KEY FK_ed25eeab5ca90d157498123424`,
        );

        // Optionally revert the property_id modification
        await queryRunner.query(
            `ALTER TABLE property_likes MODIFY property_id VARCHAR(255)`,
        ); // Use your original data type

        // Optionally revert the engine change
        // Uncomment the following line if you want to change it back to MyISAM or another engine
        // await queryRunner.query(`ALTER TABLE wp_realty_listingsdb ENGINE=MyISAM`);
    }
}
