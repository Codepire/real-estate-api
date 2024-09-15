import { TimeStampedCommonEntities } from 'src/common/entities';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UsersEntity extends TimeStampedCommonEntities {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ unique: true })
    email: string;

    @Column()
    username: string;

    @Column()
    profile_url: string;

    @Column({ nullable: true })
    password?: string;
}
