import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: any) {
    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    
    // this.logger.log(`JWT Auth attempt for ${req.url} from IP ${ip}, User: ${JSON.stringify(user)}`);
    
    if (err || !user) {
      // this.logger.error(`zJWT Auth failed: ${err?.message || 'No user'}`);
    }
    
    return super.handleRequest(err, user, info, context);
  }
}
