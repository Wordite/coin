import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Request } from 'express'
import { AntiSpamService } from './anti-spam.service'
import { fingerprintKey } from 'src/common/utils/fingerprint'

@Injectable()
export class AntiSpamGuard implements CanActivate {
  constructor(private readonly antiSpamService: AntiSpamService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    const fingerprint = request.headers.fingerprint as string
    const ip = request.ip || 'unknown'
    const ua = request.get('user-agent') || 'unknown'

    const key = fingerprintKey(fingerprint, ip, ua)

    const isBlocked = await this.antiSpamService.isBlocked(key)

    if (isBlocked) {
      throw new ForbiddenException('Access denied: User is blocked due to spam activity')
    }

    return true
  }
}
