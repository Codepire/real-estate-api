import { Injectable } from '@nestjs/common';
import findAllImages from 'src/common/find-all-property-images';
import { DataSource } from 'typeorm';

@Injectable()
export class CronService {
    constructor(private readonly dataSource: DataSource) { }

    async syncPropertyImages() {
        try {

            const allProperties = await this.dataSource.query(
                `
                SELECT
                    listingsdb_id,
                    Matrix_Unique_ID
                FROM    
                    wp_realty_listingsdb
                WHERE 
                    property_images = '[]'
                `
            )
            
            const batchSize = 500;
            const totalBatches = Math.ceil(allProperties?.length / batchSize);
            
            const processBatch = async (batch) => {
                await Promise.all(batch.map(async (el: { listingsdb_id: string, Matrix_Unique_ID: string }) => {
                    try {

                        const foundAllImages = await findAllImages(el['Matrix_Unique_ID'])
                        await this.dataSource.query(
                            `
                            UPDATE wp_realty_listingsdb
                            SET property_images = ?
                            WHERE listingsdb_id = ?
                            `, [JSON.stringify(foundAllImages), el?.listingsdb_id]
                        )
                    } catch (error) {
                        console.error(error)
                    }
                }))
            }
            
            for (let i = 0; i < totalBatches; i++) {
                console.log('Processing batch', i)
                const batch = allProperties?.slice(i * batchSize, (i + 1) * batchSize)
                await processBatch(batch);
            }
        } catch {
            console.log('error in batch')
        }

        return 'ok'
    }
}
