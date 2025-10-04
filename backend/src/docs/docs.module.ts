import { Module } from '@nestjs/common'
import { DocsService } from './docs.service'
import { DocsConfigService } from './docs-config.service'
import { DocsController } from './docs.controller'
import { DocsContentController } from './docs-content.controller'
import { DocsContentService } from './docs-content.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SessionModule } from '../session/session.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, SessionModule, AuthModule],
  controllers: [DocsController, DocsContentController],
  providers: [DocsService, DocsConfigService, DocsContentService],
})

export class DocsModule {}
