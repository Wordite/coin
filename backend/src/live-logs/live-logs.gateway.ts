import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LiveLogsService } from './live-logs.service';

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' ? [
      'https://tycoin.app', 'https://admin.tycoin.app', 'https://docs.tycoin.app'
    ] : [
      'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
      'http://localhost:3000', 'http://localhost:3003', 'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
  },
  namespace: '/live-logs',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class LiveLogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LiveLogsGateway.name);
  private readonly connectedClients = new Map<string, { socket: Socket; subscriptions: Set<string> }>();

  constructor(private readonly liveLogsService: LiveLogsService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`[LIVE LOGS] Client connected: ${client.id}`);
    this.logger.log(`[LIVE LOGS] Client origin: ${client.handshake.headers.origin}`);
    this.logger.log(`[LIVE LOGS] Client user-agent: ${client.handshake.headers['user-agent']}`);
    this.connectedClients.set(client.id, { socket: client, subscriptions: new Set() });
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`[LIVE LOGS] Client disconnected: ${client.id}`);
    const clientData = this.connectedClients.get(client.id);
    
    if (clientData) {
      // Stop watching all files for this client
      clientData.subscriptions.forEach(filename => {
        this.liveLogsService.stopWatching(filename);
      });
    }
    
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('subscribe-logs')
  async handleSubscribeLogs(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { logType: string; filename?: string }
  ) {
    try {
      this.logger.log(`[LIVE LOGS] Client ${client.id} subscribing to logs:`, data);
      
      const clientData = this.connectedClients.get(client.id);
      if (!clientData) {
        this.logger.error(`[LIVE LOGS] Client data not found for ${client.id}`);
        client.emit('log-error', { message: 'Client not found' });
        return;
      }

      let targetFile: string;
      
      if (data.filename) {
        targetFile = data.filename;
        this.logger.log(`[LIVE LOGS] Using specified filename: ${targetFile}`);
      } else {
        // Default to all.log for 'all' type
        this.logger.log(`[LIVE LOGS] Getting available log files...`);
        const logFiles = await this.liveLogsService.getLogFiles();
        this.logger.log(`[LIVE LOGS] Available log files:`, logFiles);
        
        targetFile = logFiles.find(file => file.includes('all.log')) || logFiles[0];
        this.logger.log(`[LIVE LOGS] Selected target file: ${targetFile}`);
      }

      if (!targetFile) {
        this.logger.error(`[LIVE LOGS] No target file found`);
        client.emit('log-error', { message: 'No log files found' });
        return;
      }

      // Send initial log history
      this.logger.log(`[LIVE LOGS] Getting initial log history from ${targetFile}`);
      const history = await this.liveLogsService.getLastLines(targetFile, 1000);
      this.logger.log(`[LIVE LOGS] Sending ${history.length} lines to client`);
      client.emit('log-history', history);

      // Set up file watching
      this.logger.log(`[LIVE LOGS] Setting up file watcher for ${targetFile}`);
      this.liveLogsService.watchLogFile(targetFile, (newLines: string[]) => {
        this.logger.log(`[LIVE LOGS] File changed, sending ${newLines.length} new lines to client`);
        client.emit('log-update', newLines);
      });

      // Track subscription
      clientData.subscriptions.add(targetFile);
      
      client.emit('log-subscribed', { filename: targetFile });
      this.logger.log(`[LIVE LOGS] Client ${client.id} subscribed to ${targetFile}`);
      
    } catch (error) {
      this.logger.error(`[LIVE LOGS] Error handling subscription:`, error);
      client.emit('log-error', { message: 'Failed to subscribe to logs' });
    }
  }

  @SubscribeMessage('unsubscribe-logs')
  async handleUnsubscribeLogs(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { filename: string }
  ) {
    try {
      this.logger.log(`[LIVE LOGS] Client ${client.id} unsubscribing from:`, data.filename);
      
      const clientData = this.connectedClients.get(client.id);
      if (clientData) {
        this.liveLogsService.stopWatching(data.filename);
        clientData.subscriptions.delete(data.filename);
        client.emit('log-unsubscribed', { filename: data.filename });
      }
    } catch (error) {
      this.logger.error(`[LIVE LOGS] Error handling unsubscription:`, error);
      client.emit('log-error', { message: 'Failed to unsubscribe from logs' });
    }
  }

  @SubscribeMessage('get-log-files')
  async handleGetLogFiles(@ConnectedSocket() client: Socket) {
    try {
      const logFiles = await this.liveLogsService.getLogFiles();
      client.emit('log-files', logFiles);
    } catch (error) {
      this.logger.error(`[LIVE LOGS] Error getting log files:`, error);
      client.emit('log-error', { message: 'Failed to get log files' });
    }
  }
}
