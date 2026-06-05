import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

type SocketUser = {
  id: number;
  email: string;
  role: string;
};

type ChatSocket = Socket & {
  user?: SocketUser;
};

type SendMessagePayload = {
  conversationId: number;
  content: string;
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  },
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatsService: ChatsService,
    private readonly jwtService: JwtService,
  ) { }

  handleConnection(client: ChatSocket) {
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<SocketUser>(token);
      client.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('chat:join')
  async joinConversation(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: { conversationId: number },
  ) {
    if (!client.user || !payload?.conversationId) {
      return { ok: false, message: 'Unauthorized' };
    }

    await this.chatsService.findConversationForUser(payload.conversationId, client.user);
    await client.join(this.getConversationRoom(payload.conversationId));

    return { ok: true };
  }

  @SubscribeMessage('chat:leave')
  async leaveConversation(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: { conversationId: number },
  ) {
    if (payload?.conversationId) {
      await client.leave(this.getConversationRoom(payload.conversationId));
    }

    return { ok: true };
  }

  @SubscribeMessage('chat:send')
  async sendMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    if (!client.user || !payload?.conversationId || !payload.content?.trim()) {
      return { ok: false, message: 'Invalid message' };
    }

    const response = await this.chatsService.sendMessage(
      payload.conversationId,
      client.user,
      payload.content,
    );

    this.server
      .to(this.getConversationRoom(payload.conversationId))
      .emit('chat:message', response.data);

    return { ok: true, data: response.data };
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string') {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      return authorization.slice('Bearer '.length);
    }

    return null;
  }

  private getConversationRoom(conversationId: number) {
    return `conversation:${conversationId}`;
  }
}
