import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    userId: number

    @Column()
    restaurantId: number

    @Column({ nullable: true })
    deliveryPersonId: number

    @Column()
    phoneNumber: string

    @Column()
    deliveryFee: number

    @Column({ type: 'float', default: 0 })
    subtotal: number

    @Column({ type: 'float', default: 0 })
    totalAmount: number

    @Column({ default: 'pending' })
    paymentStatus: string

    @Column({ default: 'cash' })
    paymentMethod: string

    @Column({ default: 'pending' })
    orderStatus: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}