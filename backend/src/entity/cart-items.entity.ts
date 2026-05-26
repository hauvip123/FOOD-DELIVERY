import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('cart_items')
export class CartItems {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    cartId: number

    @Column()
    dishId: number

    @Column()
    quantity: number

    @Column()
    name: string

    @Column()
    price: number

    @Column({ nullable: true })
    note: string
}