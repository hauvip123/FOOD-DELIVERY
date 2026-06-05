import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatConversation } from 'src/entity/chat-conversation.entity';
import { ChatMessage } from 'src/entity/chat-message.entity';
import { Restaurant } from 'src/entity/restaurant.entity';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ChatConversation, ChatMessage, Restaurant])],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
})
export class ChatsModule { }
