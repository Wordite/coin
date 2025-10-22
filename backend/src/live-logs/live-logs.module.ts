import { Module } from '@nestjs/common';
import { LiveLogsService } from './live-logs.service';
import { LiveLogsController } from './live-logs.controller';
import { LiveLogsGateway } from './live-logs.gateway';

@Module({
  controllers: [LiveLogsController],
  providers: [LiveLogsService, LiveLogsGateway],
  exports: [LiveLogsService],
})
export class LiveLogsModule {}
