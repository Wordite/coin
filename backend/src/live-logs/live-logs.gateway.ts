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
import { SessionService } from '../session/session.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

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

  constructor(
    private readonly liveLogsService: LiveLogsService,
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    this.logger.log('[LIVE LOGS] Gateway initialized with namespace: /live-logs');
  }

  async handleConnection(client: Socket) {
    // Extract cookies from handshake
    const cookies = client.handshake.headers.cookie;
    if (!cookies) {
      client.disconnect();
      return;
    }
    
    // Parse refresh token from cookies
    const refreshToken = this.extractCookie(cookies, 'refreshToken');
    if (!refreshToken) {
      client.disconnect();
      return;
    }
    
    // Validate session using AuthService and SessionService
    try {
      const sessionId = await this.authService.getSessionIdFromRefreshToken(refreshToken);
      const session = await this.sessionService.find(sessionId);
      
      if (!session || !session.userId) {
        client.disconnect();
        return;
      }
      
      // Get user details to check roles
      const user = await this.userService.findById(session.userId);
      if (!user || user.role !== 'ADMIN') {
        client.disconnect();
        return;
      }
    } catch (error) {
      client.disconnect();
      return;
    }
    
    this.connectedClients.set(client.id, { socket: client, subscriptions: new Set() });
  }

  async handleDisconnect(client: Socket) {
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
      const clientData = this.connectedClients.get(client.id);
      if (!clientData) {
        client.emit('log-error', { message: 'Client not found' });
        return;
      }

      let targetFile: string;
      
      if (data.filename) {
        targetFile = data.filename;
      } else {
        const logFiles = await this.liveLogsService.getLogFiles();
        targetFile = logFiles.find(file => file.includes('all.log')) || logFiles[0];
      }

      if (!targetFile) {
        client.emit('log-error', { message: 'No log files found' });
        return;
      }

      // Send initial log history
      const history = await this.liveLogsService.getLastLines(targetFile, 1000);
      client.emit('log-history', history);

      // Set up file watching
      this.liveLogsService.watchLogFile(targetFile, (newLines: string[]) => {
        client.emit('log-update', newLines);
      });

      // Track subscription
      clientData.subscriptions.add(targetFile);
      
      client.emit('log-subscribed', { filename: targetFile });
      
    } catch (error) {
      client.emit('log-error', { message: 'Failed to subscribe to logs' });
    }
  }

  @SubscribeMessage('unsubscribe-logs')
  async handleUnsubscribeLogs(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { filename: string }
  ) {
    try {
      const clientData = this.connectedClients.get(client.id);
      if (clientData) {
        this.liveLogsService.stopWatching(data.filename);
        clientData.subscriptions.delete(data.filename);
        client.emit('log-unsubscribed', { filename: data.filename });
      }
    } catch (error) {
      client.emit('log-error', { message: 'Failed to unsubscribe from logs' });
    }
  }

  @SubscribeMessage('get-log-files')
  async handleGetLogFiles(@ConnectedSocket() client: Socket) {
    try {
      const logFiles = await this.liveLogsService.getLogFiles();
      client.emit('log-files', logFiles);
    } catch (error) {
      client.emit('log-error', { message: 'Failed to get log files' });
    }
  }

  private extractCookie(cookieHeader: string, cookieName: string): string | null {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const cookie = cookies.find(c => c.startsWith(`${cookieName}=`));
    return cookie ? cookie.split('=')[1] : null;
  }
}
