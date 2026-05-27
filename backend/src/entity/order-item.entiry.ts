import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('order_item')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    orderId: number

    @Column()
    dishId: number

    @Column()
    quantity: number

    @Column({ type: 'float' })
    price: number

    @Column()
    name: string

    @Column({ nullable: true })
    note: string
}