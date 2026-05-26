import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("carts")
export class Carts {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number

    @Column()
    restaurantId: number

    @Column({ type: 'float', default: '0.00' })
    totalAmount: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}