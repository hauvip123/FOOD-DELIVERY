import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Categories } from "./categories.entity";
import { User } from "./user.entity";

@Entity('restaurant')
export class Restaurant {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    ownerId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ownerId' })
    owner: User;

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