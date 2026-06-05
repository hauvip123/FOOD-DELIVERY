import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { User } from './user.entity';

@Entity('chat_conversations')
@Index(['userId', 'restaurantId'], { unique: true })
export class ChatConversation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    restaurantId: number;

    @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'restaurantId' })
    restaurant: Restaurant;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    lastMessage: string | null;

    @Column({ type: 'datetime', nullable: true })
    lastMessageAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
