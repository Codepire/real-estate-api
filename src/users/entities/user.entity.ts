import { TimeStampedCommonEntities } from 'src/common/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OtpEntity } from './otp.entity';
import { UserRoleEnum } from 'src/common/enums';
import { UserAnalyticsEntity } from 'src/analytics/entities/user-analytics.entity';

@Entity({ name: 'users' })
export class UsersEntity extends TimeStampedCommonEntities {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ unique: true })
    email: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({
        default:
            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    })
    profile_url: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    salt?: string;

    @Column({ nullable: true })
    phone_number?: string;

    @Column({ default: false })
    is_verified_email?: boolean;

    @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.USER })
    role?: string;

    /* Relations */
    @OneToMany(() => OtpEntity, (otpEntity) => otpEntity.user)
    otps?: OtpEntity[];

    @OneToMany(() => UserAnalyticsEntity, (userAnalytics) => userAnalytics.user)
    userAnalytics?: UserAnalyticsEntity[];
}
