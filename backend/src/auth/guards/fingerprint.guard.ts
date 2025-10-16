import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common'

@Injectable()
export class FingerprintGuard implements CanActivate {
  private readonly logger = new Logger(FingerprintGuard.name)

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const fingerprint = req.headers['fingerprint'] as string

    // this.logger.log(`FingerprintGuard: Request from IP: ${req.ip}`)
    // this.logger.log(`FingerprintGuard: User-Agent: ${req.headers['user-agent']}`)
    // this.logger.log(`FingerprintGuard: Fingerprint present: ${!!fingerprint}`)
    // this.logger.log(`FingerprintGuard: Fingerprint length: ${fingerprint?.length || 0}`)
    // this.logger.log(`FingerprintGuard: Fingerprint value: ${fingerprint}`)

    if (!fingerprint) {
      this.logger.error(`FingerprintGuard: Fingerprint is required from IP: ${req.ip}`)
      throw new UnauthorizedException('Something went wrong')
    }

    // this.logger.log(`FingerprintGuard: Fingerprint validation passed`)
    return true
  }
}
