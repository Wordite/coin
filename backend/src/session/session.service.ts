import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Session } from '@prisma/client'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { UserService } from 'src/user/user.service'

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name)

  constructor(private prisma: PrismaService, private config: ConfigService, private user: UserService) {}

  async create(options: {
    userId?: string
    authorizationRequestId?: string
    activationLinkId: string
    fingerprint: string
  }): Promise<Session> {
    const { userId, authorizationRequestId, activationLinkId, fingerprint } = options

    if (!userId && !authorizationRequestId) {
      throw new Error('Either userId or authorizationRequestId must be provided')
    }

    const data: any = {
      fingerprint: await bcrypt.hash(fingerprint, Number(this.config.get('BCRYPT_SALT_ROUNDS'))!),
    }

    if (userId) {
      data.userId = userId
    } else if (authorizationRequestId) {
      data.authorizationRequest = {
        connect: { id: authorizationRequestId }
      }
    }

    if (activationLinkId) {
      data.activationLink = {
        connect: { id: activationLinkId }
      }
    }

    const session = await this.prisma.session.create({ data })
    this.logger.log(`Created session: ${session.id}`)

    return session
  }

  async addRefreshToken(sessionId: string, hashedRefreshToken: string): Promise<Session> {
    const session = await this.prisma.session.update({
      where: { id: sessionId },
      data: { refreshToken: hashedRefreshToken },
    })

    return session
  }

  async activate(activationLinkId: string): Promise<Session> {
    const session = await this.prisma.session.findFirst({
      where: {
        activationLink: {
          id: activationLinkId
        }
      },
      include: {
        activationLink: {
          include: {
            authorizationRequest: true
          }
        }
      }
    })

    if (!session) {
      throw new NotFoundException('Session not found for this activation link')
    }

    this.logger.log(`Activating session: ${session.id}`)

    const updatedSession = await this.prisma.session.update({
      where: { id: session.id },
      data: { isActivated: true },
    })

    this.logger.log(`Activated session: ${updatedSession.id}`)
    return updatedSession
  }

  async updateRefreshToken(oldRefreshToken: string, newRefreshToken: string): Promise<Session> {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: oldRefreshToken },
    })

    if (!session) {
      throw new NotFoundException('Session not found')
    }
    const updatedSession = await this.prisma.session.update({
      where: { refreshToken: oldRefreshToken },
      data: { refreshToken: newRefreshToken },
    })

    return updatedSession
  }

  async setUserByEmail(sessionId: string, email: string): Promise<void> {
    const user = await this.user.findByEmail(email)
    if (!user) throw new NotFoundException('User not found')

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { userId: user.id, authorizationRequest: undefined },
    })
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.session.delete({
      where: { id },
    })

    return true
  }

  async find(id: string): Promise<Session> {
    const session = await this.prisma.session.findUnique({
      where: { id },
    })

    if (!session) {
      throw new NotFoundException('Session not found')
    }

    return session
  }

  async findAll(): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany()

    return sessions
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        updatedAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
      },
    })
  }
}
