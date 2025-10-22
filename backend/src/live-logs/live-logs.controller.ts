import { Controller, Get, Param, Query } from '@nestjs/common';
import { LiveLogsService } from './live-logs.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/constants/roles.constant';

@Controller('live-logs')
export class LiveLogsController {
  constructor(private readonly liveLogsService: LiveLogsService) {}

  @Get('files')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getLogFiles() {
    const files = await this.liveLogsService.getLogFiles();
    return { files };
  }

  @Get('tail/:filename')
  @Auth({ roles: [Roles.ADMIN], strong: true })
  async getLogTail(
    @Param('filename') filename: string,
    @Query('lines') lines: string = '1000'
  ) {
    const linesCount = parseInt(lines, 10) || 1000;
    const logLines = await this.liveLogsService.getLastLines(filename, linesCount);
    return { lines: logLines, filename, count: logLines.length };
  }
}
