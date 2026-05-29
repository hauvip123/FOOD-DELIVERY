import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity('reviews')
@Unique(['orderId'])
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    restaurantId: number;

    @Column()
    orderId: number;

    @Column()
    rating: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    comment: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}