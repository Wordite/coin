import { Module } from '@nestjs/common'
import { AuthorizationRequestService } from './authorization-request.service'
import { AuthorizationRequestController } from './authorization-request.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SessionModule } from 'src/session/session.module'
import { UserModule } from 'src/user/user.module'
import { ActivationLinkModule } from 'src/activation-link/activation-link.module'

@Module({
  imports: [PrismaModule, SessionModule, UserModule, ActivationLinkModule],
  controllers: [AuthorizationRequestController],
  providers: [AuthorizationRequestService],
  exports: [AuthorizationRequestService],
})
export class AuthorizationRequestModule {}
