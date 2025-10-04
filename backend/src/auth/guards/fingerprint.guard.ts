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
    console.log('fingerprint', req.headers['fingerprint'])
    const fingerprint = req.headers['fingerprint'] as string

    if (!fingerprint) {
      this.logger.error(`Fingerprint is required: ${req.ip}`)
      throw new UnauthorizedException('Something went wrong')
    }

    return true
  }
}
