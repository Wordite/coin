import { Module } from '@nestjs/common';
import { LiveLogsService } from './live-logs.service';
import { LiveLogsController } from './live-logs.controller';
import { LiveLogsGateway } from './live-logs.gateway';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SessionModule, AuthModule, UserModule],
  controllers: [LiveLogsController],
  providers: [LiveLogsService, LiveLogsGateway],
  exports: [LiveLogsService],
})
export class LiveLogsModule {}
