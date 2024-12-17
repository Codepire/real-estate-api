import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class CityImageMapping {
    @PrimaryColumn()
    city: string;

    @Column({ unique: true })
    imageUrl: string;
}