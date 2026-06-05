import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { SendChatMessageDto } from './dto/send-chat-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) { }

    @Get()
    findMyConversations(@Req() req) {
        return this.chatsService.findMyConversations(req.user);
    }

    @Post('restaurants/:restaurantId')
    startConversation(
        @Req() req,
        @Param('restaurantId', ParseIntPipe) restaurantId: number,
    ) {
        return this.chatsService.startConversation(req.user.id, restaurantId);
    }

    @Get(':conversationId/messages')
    findMessages(
        @Req() req,
        @Param('conversationId', ParseIntPipe) conversationId: number,
    ) {
        return this.chatsService.findMessages(conversationId, req.user);
    }

    @Post(':conversationId/messages')
    sendMessage(
        @Req() req,
        @Param('conversationId', ParseIntPipe) conversationId: number,
        @Body() sendChatMessageDto: SendChatMessageDto,
    ) {
        return this.chatsService.sendMessage(conversationId, req.user, sendChatMessageDto.content);
    }
}
