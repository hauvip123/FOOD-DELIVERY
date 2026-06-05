import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatConversation } from './chat-conversation.entity';
import { User } from './user.entity';

@Entity('chat_messages')
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    conversationId: number;

    @ManyToOne(() => ChatConversation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversationId' })
    conversation: ChatConversation;

    @Column()
    senderId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender: User;

    @Column()
    senderRole: string;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn()
    createdAt: Date;
}
