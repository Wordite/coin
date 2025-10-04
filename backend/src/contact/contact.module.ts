import { Module } from '@nestjs/common'
import { ContactController } from './contact.controller'
import { ContactService } from './contact.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AntiSpamModule } from '../anti-spam/anti-spam.module'
import { SessionModule } from '../session/session.module'
import { AuthModule } from '../auth/auth.module'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [PrismaModule, AntiSpamModule, SessionModule, AuthModule, MailModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
