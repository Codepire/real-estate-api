import { TimeStampedCommonEntities } from 'src/common/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'blogs' })
export class BlogsEntity extends TimeStampedCommonEntities {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: 'varchar', length: 1000 })
    body: string;

    @Column({ type: 'varchar', length: 200, unique: true })
    thumbnail_url: string;

    @Column({ type: 'varchar', length: 20 })
    tag: string;
}
