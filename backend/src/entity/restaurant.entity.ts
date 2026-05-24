import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('restaurant')
export class Restaurant {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    ownerId: number;

    @Column()
    name: string

    @Column()
    address: string

    @Column()
    city: string

    @Column()
    cuisine: string

    @Column({ nullable: true })
    imgage: string

    @Column({ type: 'text', nullable: true })
    description: string

    @Column({ nullable: true })
    phoneNumber: string

    @Column()
    openTime: string;

    @Column()
    closeTime: string;

    @Column({ default: true })
    isOpen: boolean;

    @Column({ type: 'float', default: 0.0 })
    ratingAverage: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}