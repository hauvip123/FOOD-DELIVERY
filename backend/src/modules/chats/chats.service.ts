import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatConversation } from 'src/entity/chat-conversation.entity';
import { ChatMessage } from 'src/entity/chat-message.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { In, Repository } from 'typeorm';

type AuthenticatedUser = {
    id: number;
    role: string;
};

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(ChatConversation) private readonly conversationRepository: Repository<ChatConversation>,
        @InjectRepository(ChatMessage) private readonly messageRepository: Repository<ChatMessage>,
        @InjectRepository(Restaurant) private readonly restaurantRepository: Repository<Restaurant>,
    ) { }

    async findMyConversations(user: AuthenticatedUser) {
        const where = await this.buildConversationWhere(user);
        const conversations = await this.conversationRepository.find({
            where,
            relations: {
                restaurant: true,
                user: true,
            },
            order: {
                lastMessageAt: 'DESC',
                updatedAt: 'DESC',
            },
        });

        return {
            statusCode: 200,
            message: 'Conversations fetched successfully',
            data: conversations,
        }
    }

    async startConversation(userId: number, restaurantId: number) {
        const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new NotFoundException('Restaurant not found')
        }

        let conversation = await this.findConversationByPair(userId, restaurantId);

        if (!conversation) {
            const newConversation = this.conversationRepository.create({
                userId,
                restaurantId,
                lastMessage: null,
                lastMessageAt: null,
            });

            try {
                const savedConversation = await this.conversationRepository.save(newConversation);
                conversation = await this.conversationRepository.findOne({
                    where: { id: savedConversation.id },
                    relations: {
                        restaurant: true,
                        user: true,
                    },
                });
            } catch (error) {
                if (this.isDuplicateConversationError(error)) {
                    conversation = await this.findConversationByPair(userId, restaurantId);
                } else {
                    throw error;
                }
            }
        }

        return {
            statusCode: 200,
            message: 'Conversation ready',
            data: conversation,
        }
    }

    async findMessages(conversationId: number, user: AuthenticatedUser) {
        const conversation = await this.findConversationForUser(conversationId, user);
        const messages = await this.messageRepository.find({
            where: { conversationId: conversation.id },
            relations: {
                sender: true,
            },
            order: { createdAt: 'ASC' },
        });

        return {
            statusCode: 200,
            message: 'Messages fetched successfully',
            data: messages,
        }
    }

    async sendMessage(conversationId: number, user: AuthenticatedUser, content: string) {
        const conversation = await this.findConversationForUser(conversationId, user);
        const normalizedContent = content.trim();

        const message = this.messageRepository.create({
            conversationId: conversation.id,
            senderId: user.id,
            senderRole: user.role,
            content: normalizedContent,
        });
        const savedMessage = await this.messageRepository.save(message);

        conversation.lastMessage = normalizedContent;
        conversation.lastMessageAt = savedMessage.createdAt;
        await this.conversationRepository.save(conversation);

        const messageWithSender = await this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: {
                sender: true,
            },
        });

        return {
            statusCode: 201,
            message: 'Message sent successfully',
            data: messageWithSender,
        }
    }

    private async findConversationByPair(userId: number, restaurantId: number) {
        return this.conversationRepository.findOne({
            where: { userId, restaurantId },
            relations: {
                restaurant: true,
                user: true,
            },
        });
    }

    private isDuplicateConversationError(error: unknown) {
        return typeof error === 'object'
            && error !== null
            && 'code' in error
            && (error as { code?: string }).code === 'ER_DUP_ENTRY';
    }

    private async buildConversationWhere(user: AuthenticatedUser) {
        if (user.role === 'admin') {
            return {};
        }

        const ownedRestaurants = await this.restaurantRepository.find({
            where: { ownerId: user.id },
            select: { id: true },
        });
        const ownedRestaurantIds = ownedRestaurants.map((restaurant) => restaurant.id);

        if (ownedRestaurantIds.length === 0) {
            return { userId: user.id };
        }

        return [
            { userId: user.id },
            { restaurantId: In(ownedRestaurantIds) },
        ];
    }

    async findConversationForUser(conversationId: number, user: AuthenticatedUser) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: {
                restaurant: true,
                user: true,
            },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found')
        }

        if (user.role === 'admin' || conversation.userId === user.id || conversation.restaurant?.ownerId === user.id) {
            return conversation;
        }

        throw new ForbiddenException('You cannot access this conversation')
    }
}
