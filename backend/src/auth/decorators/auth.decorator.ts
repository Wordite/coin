import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { LocalAuthGuard } from '../guards/local.guard'
import { Roles } from '../decorators/roles.decorator'
import { Role } from '../constants/roles.constant'
import { RolesGuard } from '../guards/roles.guard'
import { FingerprintGuard } from '../guards/fingerprint.guard'
import { AntiSpamGuard } from 'src/anti-spam/anti-spam.guard'
import { StrongAuthGuard } from '../guards/strong.guard'

export const IS_PUBLIC_KEY = 'isPublic'

interface AuthOptions {
  strategy?: 'jwt' | 'local'
  roles?: Role[]
  public?: boolean
  fingerprint?: boolean
  antiSpam?: boolean
  strong?: boolean
}

export function Auth(opts: AuthOptions = {}) {
  const {
    strategy = 'jwt',
    roles = [],
    public: isPublic,
    fingerprint = false,
    antiSpam = false,
    strong = false,
  } = opts

  const decos: any[] = []

  if (isPublic) {
    decos.push(SetMetadata(IS_PUBLIC_KEY, true))
  }

  if (antiSpam) {
    decos.push(UseGuards(AntiSpamGuard))
  }

  if (fingerprint) {
    decos.push(UseGuards(FingerprintGuard))
  }

  if (strong) {
    decos.push(UseGuards(StrongAuthGuard))
  }

  if (!isPublic) {
    if (strategy === 'local') {
      decos.push(UseGuards(LocalAuthGuard))
    } else {
      if (roles?.length) {
        decos.push(UseGuards(JwtAuthGuard, RolesGuard))
      } else {
        decos.push(UseGuards(JwtAuthGuard))
      }
    }
  }

  if (roles?.length) {
    decos.push(Roles(...roles))
  }

  return applyDecorators(...decos)
}
