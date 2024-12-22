// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class PointIndex1729964897242 implements MigrationInterface {
//     public async up(queryRunner: QueryRunner): Promise<void> {
//         // 1. Add the 'location_point' column as NULLABLE
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb 
//             ADD COLUMN location_point POINT NULL;
//         `);

//         // 2. Populate the 'location_point' column with existing data
//         await queryRunner.query(`
//             UPDATE wp_realty_listingsdb 
//             SET location_point = POINT(longitude, latitude);
//         `);

//         // 3. Alter the 'location_point' column to NOT NULL
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb 
//             MODIFY COLUMN location_point POINT NOT NULL;
//         `);

//         // 4. Add a spatial index on the 'location_point' column
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb 
//             ADD SPATIAL INDEX idx_location_point (location_point);
//         `);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         // 1. Drop the spatial index
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb 
//             DROP INDEX idx_location_point;
//         `);

//         // 2. Drop the 'location_point' column
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb 
//             DROP COLUMN location_point;
//         `);
//     }
// }
