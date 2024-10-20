import { TimeStampedCommonEntities } from 'src/common/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'property_visits' })
export class PropertyVisitsEntity extends TimeStampedCommonEntities {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ unique: true })
    ip: string;

    @Column({ nullable: true })
    visitCount: number;
}
