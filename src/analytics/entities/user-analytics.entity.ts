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
    })
    @JoinColumn({ name: 'user_id' })
    user: UsersEntity;

    @CreateDateColumn()
    created_at?: Date;

    // user's ip address
    // ip: string;

    // user's user agent
    // userAgent: string;

    // // which page user was previously on
    // referer: string;

    // // which device user is using
    // device: string;

    // // which browser user is using
    // browser: string;

    // // which operating system user is using
    // os: string;
    // country: string;
    // city: string;
    // latitude: string;
    // longitude: string;
}
