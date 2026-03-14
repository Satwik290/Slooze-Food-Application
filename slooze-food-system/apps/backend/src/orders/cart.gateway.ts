import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/cart',
})
export class CartGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CartGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Client emits 'joinRegion' with their regionId after connecting.
   * Server places them in a Socket.io room scoped to that region.
   */
  @SubscribeMessage('joinRegion')
  handleJoinRegion(@MessageBody() regionId: string, @ConnectedSocket() client: Socket): void {
    void client.join(`region:${regionId}`);
    this.logger.log(`Client ${client.id} joined region:${regionId}`);
    client.emit('joinedRegion', { regionId });
  }

  /** Broadcast updated cart to all clients in the region room. */
  emitCartUpdate(regionId: string, cart: unknown): void {
    this.server.to(`region:${regionId}`).emit('cartUpdated', cart);
    this.logger.log(`Emitted cartUpdated to region:${regionId}`);
  }

  /** Broadcast cart cleared/checked-out to all clients in the region room. */
  emitCartCleared(regionId: string): void {
    this.server.to(`region:${regionId}`).emit('cartCleared', { regionId });
    this.logger.log(`Emitted cartCleared to region:${regionId}`);
  }

  /** Broadcast that a new user joined the shared cart via link. */
  emitUserJoined(regionId: string, userName: string): void {
    this.server.to(`region:${regionId}`).emit('userJoined', { userName });
    this.logger.log(`Emitted userJoined to region:${regionId} — ${userName}`);
  }
}
