import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: any) {
    const req = context.switchToHttp().getRequest();
    this.logger.log(`JWT Auth attempt for ${req.url}`);
    this.logger.log(`Authorization header: ${req.headers.authorization}`);
    this.logger.log(`User: ${JSON.stringify(user)}`);
    
    if (err || !user) {
      this.logger.error(`JWT Auth failed: ${err?.message || 'No user'}`);
    }
    
    return super.handleRequest(err, user, info, context);
  }
}
