import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { SessionService } from 'src/session/session.service'
import { AuthService } from '../auth.service'
import { compare } from 'src/common/utils/hash'

@Injectable()
export class StrongAuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    
    const refreshToken = request.cookies?.refreshToken
    const fingerprint = request.headers.fingerprint as string

    if (!refreshToken || !fingerprint) {
      throw new UnauthorizedException('Missing refresh token or fingerprint')
    }

    try {
      const sessionId = await this.authService.getSessionIdFromRefreshToken(refreshToken)
      
      if (!sessionId) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      const session = await this.sessionService.find(sessionId)
      
      if (!session) {
        throw new UnauthorizedException('Session not found')
      }

      const fingerprintMatch = await compare(fingerprint, session.fingerprint)
      
      if (!fingerprintMatch) {
        throw new UnauthorizedException('Fingerprint mismatch')
      }

      return true
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new UnauthorizedException('Session validation failed')
    }
  }
}
