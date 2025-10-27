import { Module } from '@nestjs/common'
import { DatabaseBackupService } from 'src/backup/database-backup.service'

@Module({
  providers: [DatabaseBackupService],
})
export class BackupModule {}


