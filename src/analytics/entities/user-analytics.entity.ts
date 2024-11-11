import { TimeStampedCommonEntities } from 'src/common/entities';
import { EventTypeEnum } from 'src/common/enums';
import { UsersEntity } from 'src/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

// todo: add indexing on event_name, session, user_id
@Entity('user_analytics')
export class UserAnalyticsEntity {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ type: 'enum', enum: EventTypeEnum })
    event_name: string;

    @Column({ type: 'varchar', length: 255 })
    event: any;

    @ManyToOne(() => UsersEntity, (user) => user.userAnalytics, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'user_id' })
    user?: UsersEntity;

    @Column({ type: 'varchar', length: 40 })
    session: string;

    @CreateDateColumn()
    created_at?: Date;
}
