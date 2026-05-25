import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('dishes')
export class Dish {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    restaurantId: number;

    @Column()
    categoryId: number;

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