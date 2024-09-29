// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class UpdateListingdb1727554058239 implements MigrationInterface {
//     public async up(queryRunner: QueryRunner): Promise<void> {
//         // Step 1: Add the location_point column as nullable
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb
//             ADD location_point POINT NULL;
//         `);

//         // Step 2: Update the location_point with valid longitude and latitude
//         await queryRunner.query(`
//             UPDATE wp_realty_listingsdb
//             SET location_point = ST_PointFromText(CONCAT('POINT(', longitude, ' ', latitude, ')'))
//             WHERE
//                 longitude IS NOT NULL AND
//                 latitude IS NOT NULL;
//         `);

//         // Step 3: Alter the location_point column to be NOT NULL
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb
//             MODIFY location_point POINT NOT NULL; 
//         `);

//         // Step 4: Add the spatial index
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb
//             ADD SPATIAL INDEX(location_point);
//         `);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`
//             ALTER TABLE wp_realty_listingsdb
//             DROP COLUMN location_point;
//         `);
//     }
// }
