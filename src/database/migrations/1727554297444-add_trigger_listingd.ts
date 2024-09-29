// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class AddTriggerListingd1727554297444 implements MigrationInterface {
//     public async up(queryRunner: QueryRunner): Promise<void> {
//         // Create before insert trigger
//         await queryRunner.query(`
//             CREATE TRIGGER before_insert_update_location
//             BEFORE INSERT ON wp_realty_listingsdb
//             FOR EACH ROW
//             BEGIN
//                 SET NEW.location_point = ST_PointFromText(CONCAT('POINT(', NEW.longitude, ' ', NEW.latitude, ')'));
//             END;
//         `);

//         // Create before update trigger
//         await queryRunner.query(`
//             CREATE TRIGGER before_update_location
//             BEFORE UPDATE ON wp_realty_listingsdb
//             FOR EACH ROW
//             BEGIN
//                 IF (NEW.longitude IS NOT NULL AND OLD.longitude IS NOT NULL AND NEW.longitude != OLD.longitude) OR
//                    (NEW.latitude IS NOT NULL AND OLD.latitude IS NOT NULL AND NEW.latitude != OLD.latitude) THEN
//                     SET NEW.location_point = ST_PointFromText(CONCAT('POINT(', NEW.longitude, ' ', NEW.latitude, ')'));
//                 END IF;
//             END;
//         `);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`DROP TRIGGER IF EXISTS before_insert_update_location;`);
//         await queryRunner.query(`DROP TRIGGER IF EXISTS before_update_location;`);
//     }
// }

