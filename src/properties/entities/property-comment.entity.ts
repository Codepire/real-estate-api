import { TimeStampedCommonEntities } from "src/common/entities";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PropertyComment extends TimeStampedCommonEntities{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    comment: string;

    @Column()
    propertyId: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    phone_number: string;

    @Column({default: false})
    isRead: boolean;
}