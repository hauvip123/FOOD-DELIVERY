import { Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";
import { Categories } from "./categories.entity";

@Entity('dishes')
export class Dish {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    restaurantId: number;

    @ManyToOne(() => Restaurant)
    @JoinColumn({ name: 'restaurantId' })
    restaurant: Restaurant;

    @Column()
    categoryId: number;

    @ManyToOne(() => Categories)
    @JoinColumn({ name: 'categoryId' })
    category: Categories;

    @Column()
    name: string;

    @Column('float')
    price: number;

    @Column({ nullable: true })
    image: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: true })
    isAvailable: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}