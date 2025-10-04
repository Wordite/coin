import { Module } from '@nestjs/common'
import { AntiSpamService } from './anti-spam.service'
import { AntiSpamGuard } from './anti-spam.guard'
import { RedisModule } from 'src/redis/redis.module'

@Module({
  imports: [RedisModule],
  providers: [AntiSpamService, AntiSpamGuard],
  exports: [AntiSpamService, AntiSpamGuard],
})
export class AntiSpamModule {}
