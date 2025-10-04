import { BadRequestException, Injectable } from '@nestjs/common'
import { ActivationLinkService } from 'src/activation-link/activation-link.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { SessionService } from 'src/session/session.service'
import { UserService } from 'src/user/user.service'
import { hash } from 'src/common/utils/hash'
import { Session, ActivationLink } from '@prisma/client'

@Injectable()
export class AuthorizationRequestService {
  constructor(
    private prisma: PrismaService,
    private session: SessionService,
    private user: UserService,
    private activationLink: ActivationLinkService
  ) {}

  async createByEmail(email: string, password: string, fingerprint: string, isRegistration: boolean = false): Promise<{ session: Session, activationLink: ActivationLink }> {
    const isExists = await this.user.isEmailExists(email)

    if (isRegistration && isExists) {
      throw new BadRequestException('User already exists')
    }
    else if (!isRegistration && !isExists) {
      throw new BadRequestException('User not found')
    }

    const hashedPassword = await hash(password)

    const authorizationRequest = await this.prisma.authorizationRequest.create({
      data: { email, password: hashedPassword, isRegistration },
    })

    const activationLink = await this.activationLink.create({
      authorizationRequestId: authorizationRequest.id,
    })

    const session = await this.session.create({
      authorizationRequestId: authorizationRequest.id,
      activationLinkId: activationLink.id,
      fingerprint,
    })

    return {
      session,
      activationLink
    }
  }
}
