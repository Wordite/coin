import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common'
import { Request } from 'express'
import { SessionService } from 'src/session/session.service'
import { AuthService } from '../auth.service'
import { compare } from 'src/common/utils/hash'

@Injectable()
export class StrongAuthGuard implements CanActivate {
  private readonly logger = new Logger(StrongAuthGuard.name)

  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    
    const refreshToken = request.cookies?.refreshToken
    const fingerprint = request.headers.fingerprint as string

    // this.logger.log(`StrongAuthGuard: Starting authentication check`)
    // this.logger.log(`StrongAuthGuard: IP: ${request.ip}`)
    // this.logger.log(`StrongAuthGuard: User-Agent: ${request.headers['user-agent']}`)
    // this.logger.log(`StrongAuthGuard: RefreshToken present: ${!!refreshToken}`)
    // this.logger.log(`StrongAuthGuard: Fingerprint present: ${!!fingerprint}`)
    // this.logger.log(`StrongAuthGuard: Fingerprint length: ${fingerprint?.length || 0}`)

    if (!refreshToken || !fingerprint) {
      this.logger.error(`StrongAuthGuard: Missing credentials - refreshToken: ${!!refreshToken}, fingerprint: ${!!fingerprint}`)
      throw new UnauthorizedException('Missing refresh token or fingerprint')
    }

    try {
      const sessionId = await this.authService.getSessionIdFromRefreshToken(refreshToken)
      // this.logger.log(`StrongAuthGuard: SessionId extracted: ${sessionId}`)
      
      if (!sessionId) {
        // this.logger.error(`StrongAuthGuard: Invalid refresh token - no sessionId`)
        throw new UnauthorizedException('Invalid refresh token')
      }

      const session = await this.sessionService.find(sessionId)
      
      // this.logger.log(`StrongAuthGuard: Session found: ${!!session}`)
      
      if (!session) {
        // this.logger.error(`StrongAuthGuard: Session not found for sessionId: ${sessionId}`)
        throw new UnauthorizedException('Session not found')
      }

      // this.logger.log(`StrongAuthGuard: Session fingerprint length: ${session.fingerprint?.length || 0}`)
      // this.logger.log(`StrongAuthGuard: Client fingerprint length: ${fingerprint?.length || 0}`)

      const fingerprintMatch = await compare(fingerprint, session.fingerprint)
      
      // this.logger.log(`StrongAuthGuard: Fingerprint match result: ${fingerprintMatch}`)
      
      if (!fingerprintMatch) {
        // this.logger.error(`StrongAuthGuard: Fingerprint mismatch`)
        // this.logger.error(`StrongAuthGuard: Client fingerprint: ${fingerprint}`)
        // this.logger.error(`StrongAuthGuard: Session fingerprint: ${session.fingerprint}`)
        throw new UnauthorizedException('Fingerprint mismatch')
      }

      // this.logger.log(`StrongAuthGuard: Authentication successful`)
      return true
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // this.logger.error(`StrongAuthGuard: UnauthorizedException: ${error.message}`)
        throw error
      }
      this.logger.error(`StrongAuthGuard: Unexpected error: ${error.message}`)
      throw new UnauthorizedException('Session validation failed')
    }
  }
}
