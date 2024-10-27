import { UsersEntity } from 'src/users/entities/user.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

@Entity({ name: 'property_likes' })
@Unique(['user', 'property_id'])
export class PropertyLikesEntity {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @ManyToOne(() => UsersEntity, (userEntity) => userEntity.propertyLikes, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: UsersEntity;

    @Column()
    property_id: string;
}
