import { TimeStampedCommonEntities } from 'src/common/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OtpEntity } from './otp.entity';

@Entity({ name: 'users' })
export class UsersEntity extends TimeStampedCommonEntities {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column({ unique: true })
    email: string;

    @Column()
    username: string;

    @Column({
        default:
            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    })
    profile_url: string;

    @Column({ nullable: true })
    password?: string;

    @Column()
    salt?: string;

    @Column({ nullable: true })
    phone_number?: string;

    @Column({ default: false })
    is_verified_email?: boolean;

    /* Relations */
    @OneToMany(() => OtpEntity, (otpEntity) => otpEntity.user)
    otps?: OtpEntity;
}
