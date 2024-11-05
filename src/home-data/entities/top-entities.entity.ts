import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';

@Entity('top_entities')
export class TopEntitiesEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', unique: true })
    alias: string;

    @Column({ type: 'json', nullable: true })
    entities: any[];

    @BeforeInsert()
    @BeforeUpdate()
    validateEntities() {
        if (this.entities.length > 5) {
            throw new Error('Entities list cannot exceed 5 items');
        }
    }

    @CreateDateColumn()
    created_at: Date;
}
