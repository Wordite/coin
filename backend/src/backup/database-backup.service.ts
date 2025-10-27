import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const exec = promisify(execCb)

@Injectable()
export class DatabaseBackupService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseBackupService.name)
  private readonly backupDir = process.env.BACKUP_DIR || '/home/coin/backups'
  private readonly keepMax = Number(process.env.BACKUP_KEEP_MAX || 5)

  constructor() {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log('Backup scheduler disabled (NODE_ENV != production)')
      return
    }
    try {
      await this.ensureBackupDir()
      const hasAny = await this.hasAnyBackup()
      if (!hasAny) {
        this.logger.log('No backups found on startup. Creating initial backup...')
        await this.createBackup()
        await this.rotateBackups()
      }
    } catch (e: any) {
      this.logger.error(`Startup backup check failed: ${e?.message}`)
    }
  }

  // Run every 2 days at 03:00 (production only)
  @Cron('0 3 */2 * *')
  async runScheduledBackup(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') return
    try {
      await this.ensureBackupDir()
      const filePath = await this.createBackup()
      await this.rotateBackups()
      this.logger.log(`Backup created: ${filePath}`)
    } catch (error: any) {
      this.logger.error(`Backup failed: ${error?.message}`)
    }
  }

  private async ensureBackupDir(): Promise<void> {
    await fs.promises.mkdir(this.backupDir, { recursive: true })
  }

  private async hasAnyBackup(): Promise<boolean> {
    try {
      const files = await fs.promises.readdir(this.backupDir)
      return files.some((f) => f.endsWith('.sql') || f.endsWith('.sql.gz'))
    } catch {
      return false
    }
  }

  private parseDatabaseUrl(dbUrlRaw: string | undefined): { host: string; port: string; user: string; password: string; db: string } {
    if (!dbUrlRaw) throw new Error('DATABASE_URL is not set')
    // Example: postgresql://user:password@host:5432/dbname
    const url = new URL(dbUrlRaw)
    const host = url.hostname
    const port = url.port || '5432'
    const user = decodeURIComponent(url.username)
    const password = decodeURIComponent(url.password)
    const db = url.pathname.replace(/^\//, '')
    return { host, port, user, password, db }
  }

  private async createBackup(): Promise<string> {
    const db = this.parseDatabaseUrl(process.env.DATABASE_URL)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup_${db.db}_${timestamp}.sql.gz`
    const filePath = path.join(this.backupDir, filename)

    // pg_dump with gzip compression
    const env = { ...process.env, PGPASSWORD: db.password }
    const cmd = `pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.db} -F p | gzip -c > ${filePath}`

    this.logger.log(`Executing: ${cmd.replace(db.password, '****')}`)
    await exec(cmd, { env, shell: '/bin/sh' })
    return filePath
  }

  private async rotateBackups(): Promise<void> {
    const files = (await fs.promises.readdir(this.backupDir))
      .filter((f) => f.endsWith('.sql.gz'))
      .map((f) => ({ f, full: path.join(this.backupDir, f) }))
    if (files.length <= this.keepMax) return
    // Sort by mtime ascending (oldest first)
    const withStats = await Promise.all(
      files.map(async (x) => ({ ...x, stat: await fs.promises.stat(x.full) }))
    )
    withStats.sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs)
    const toDelete = withStats.slice(0, withStats.length - this.keepMax)
    for (const d of toDelete) {
      await fs.promises.unlink(d.full)
      this.logger.log(`Deleted old backup: ${d.f}`)
    }
  }
}


