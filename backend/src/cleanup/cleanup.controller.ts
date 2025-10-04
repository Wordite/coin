import { Controller, Post } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { Roles } from 'src/auth/constants/roles.constant';
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('cleanup')
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) {}

  @Post('run-all')
  @Auth({ roles: [Roles.ADMIN], strong: true }) 
  async runAllCleanups() {
    await this.cleanupService.runAllCleanups();
    return { message: 'All cleanup tasks completed successfully' };
  }
}
