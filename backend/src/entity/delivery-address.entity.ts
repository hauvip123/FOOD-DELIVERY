import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('delivery_addresses')
export class DeliveryAddress {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    orderId: number

    @Column()
    street: string

    @Column()
    city: string

    @Column({ nullable: true })
    note: string

}