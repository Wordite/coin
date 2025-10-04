import { Module, forwardRef } from '@nestjs/common'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'
import { PrismaModule } from '../prisma/prisma.module'
import { SessionModule } from '../session/session.module'
import { AuthModule } from '../auth/auth.module'
import { RedisModule } from '../redis/redis.module'

@Module({
  imports: [PrismaModule, SessionModule, forwardRef(() => AuthModule), RedisModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}