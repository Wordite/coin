import { Module } from '@nestjs/common'
import { ActivationLinkService } from './activation-link.service'
import { ActivationLinkController } from './activation-link.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SessionModule } from 'src/session/session.module'
import { UserModule } from 'src/user/user.module'

@Module({
  imports: [PrismaModule, SessionModule, UserModule],
  controllers: [ActivationLinkController],
  providers: [ActivationLinkService],
  exports: [ActivationLinkService],
})
export class ActivationLinkModule {}
