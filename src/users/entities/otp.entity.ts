import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from './user.entity';

@Entity()
export class OtpEntity {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column()
    otp: string;

    @Column()
    otp_type: string;

    @CreateDateColumn()
    created_at: string;

    @ManyToOne(() => UsersEntity, (userEntity) => userEntity.otps)
    user: UsersEntity;
}
