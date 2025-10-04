import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ActivationLink } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { SessionService } from 'src/session/session.service'
import { v4 as uuidv4 } from 'uuid'
import { UserService } from 'src/user/user.service'

@Injectable()
export class ActivationLinkService {
  constructor(
    private prisma: PrismaService,
    private session: SessionService,
    private user: UserService,
  ) {}

  private readonly logger = new Logger(ActivationLinkService.name)

  async create(options: {
    authorizationRequestId?: string
    userId?: string
  }): Promise<ActivationLink> {
    const { authorizationRequestId, userId } = options

    if (!authorizationRequestId && !userId) {
      throw new BadRequestException('Either authorizationRequestId or userId must be provided')
    }

    const data: any = {
      link: this.generateActivationLink(),
    }

    if (authorizationRequestId) {
      data.authorizationRequest = {
        connect: { id: authorizationRequestId },
      }
    } else if (userId) {
      data.user = {
        connect: { id: userId },
      }
    }

    const activationLink = await this.prisma.activationLink.create({
      data,
    })

    return activationLink
  }

  private generateActivationLink(): string {
    return uuidv4()
  }

  async activate(link: string): Promise<{ message: string }> {
    const activationLink = await this.prisma.activationLink.findUnique({
      where: { link },
      include: {
        authorizationRequest: true,
        session: true,
      },
    })

    if (!activationLink) throw new NotFoundException('Activation link not found')

    if (
      activationLink.authorizationRequestId &&
      activationLink.authorizationRequest?.isRegistration
    ) {
      await this.user.migrateFromAuthorizationRequest(activationLink.authorizationRequestId)
    }
  
    if (activationLink.authorizationRequest && !activationLink.authorizationRequest.isRegistration) {
      if (!activationLink.session) throw new NotFoundException('Session not found')
      await this.session.setUserByEmail(activationLink.session.id, activationLink.authorizationRequest.email)
    }

    await this.session.activate(activationLink.id)

    this.logger.log(`Activation link ${link} activated`)

    return { message: 'Successfully' }
  }

  async deleteExpiredActivationLinks(): Promise<void> {
    await this.prisma.activationLink.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      },
    })
  }

  async deleteActivationLink(id: string): Promise<void> {
    await this.prisma.activationLink.delete({
      where: { id },
    })
  }
}
