import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { jwtConstants } from '../constants/jwt.constant'
import { Role } from '@prisma/client'
import { TokenInvalidationService } from '../services/token-invalidation.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private tokenInvalidationService: TokenInvalidationService) {
    if (!jwtConstants.accessSecret) {
      throw new Error('JWT secret is not defined')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.accessSecret,
    })
  }

  async validate(payload: { sub: string; email: string; role: Role; iat: number }) {
    const userId = payload.sub
    
    // Проверяем, были ли инвалидированы все токены пользователя
    const areAllTokensInvalidated = await this.tokenInvalidationService.areAllUserTokensInvalidated(userId)
    
    if (areAllTokensInvalidated) {
      // Проверяем, был ли этот конкретный токен создан после инвалидации
      const invalidationTimestamp = await this.tokenInvalidationService.getUserInvalidationTimestamp(userId)
      
      if (invalidationTimestamp && payload.iat * 1000 < invalidationTimestamp) {
        throw new UnauthorizedException('Token has been invalidated due to role change')
      }
    }

    return { sub: payload.sub, email: payload.email, roles: [payload.role] }
  }
}
