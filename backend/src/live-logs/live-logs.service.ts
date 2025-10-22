import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';

@Injectable()
export class LiveLogsService {
  private readonly logger = new Logger(LiveLogsService.name);
  private readonly logsDir = path.join(process.cwd(), 'logs');
  private watchers = new Map<string, chokidar.FSWatcher>();

  async getLogFiles(): Promise<string[]> {
    try {
      this.logger.log(`[LIVE LOGS] Checking logs directory: ${this.logsDir}`);
      
      if (!fs.existsSync(this.logsDir)) {
        this.logger.error(`[LIVE LOGS] Logs directory does not exist: ${this.logsDir}`);
        return [];
      }
      
      const allFiles = fs.readdirSync(this.logsDir);
      this.logger.log(`[LIVE LOGS] All files in directory:`, allFiles);
      
      const logFiles = allFiles
        .filter(file => file.endsWith('.log'))
        .map(file => path.join(this.logsDir, file));
      
      this.logger.log(`[LIVE LOGS] Found ${logFiles.length} log files:`, logFiles);
      return logFiles;
    } catch (error) {
      this.logger.error('[LIVE LOGS] Error reading log files:', error);
      return [];
    }
  }

  async getLastLines(filename: string, lines: number = 1000): Promise<string[]> {
    try {
      this.logger.log(`[LIVE LOGS] Getting last ${lines} lines from: ${filename}`);
      
      const filePath = path.resolve(filename);
      this.logger.log(`[LIVE LOGS] Resolved file path: ${filePath}`);
      
      // Security check - ensure file is in logs directory
      if (!filePath.startsWith(this.logsDir)) {
        this.logger.error(`[LIVE LOGS] Access denied: File outside logs directory. File: ${filePath}, LogsDir: ${this.logsDir}`);
        throw new Error('Access denied: File outside logs directory');
      }

      if (!fs.existsSync(filePath)) {
        this.logger.error(`[LIVE LOGS] File does not exist: ${filePath}`);
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const allLines = content.split('\n').filter(line => line.trim());
      const lastLines = allLines.slice(-lines);
      
      this.logger.log(`[LIVE LOGS] Retrieved ${lastLines.length} lines from ${filename} (total lines in file: ${allLines.length})`);
      return lastLines;
    } catch (error) {
      this.logger.error(`[LIVE LOGS] Error reading file ${filename}:`, error);
      return [];
    }
  }

  watchLogFile(filename: string, callback: (newLines: string[]) => void): void {
    try {
      const filePath = path.resolve(filename);
      
      // Security check
      if (!filePath.startsWith(this.logsDir)) {
        throw new Error('Access denied: File outside logs directory');
      }

      // Remove existing watcher if any
      if (this.watchers.has(filename)) {
        this.watchers.get(filename)?.close();
      }

      const watcher = chokidar.watch(filePath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100
        }
      });

      watcher.on('change', async () => {
        try {
          const newLines = await this.getLastLines(filename, 10); // Get last 10 lines
          if (newLines.length > 0) {
            callback(newLines);
          }
        } catch (error) {
          this.logger.error(`[LIVE LOGS] Error processing file change for ${filename}:`, error);
        }
      });

      watcher.on('error', (error) => {
        this.logger.error(`[LIVE LOGS] Watcher error for ${filename}:`, error);
      });

      this.watchers.set(filename, watcher);
      this.logger.log(`[LIVE LOGS] Started watching ${filename}`);
    } catch (error) {
      this.logger.error(`[LIVE LOGS] Error setting up watcher for ${filename}:`, error);
    }
  }

  stopWatching(filename: string): void {
    const watcher = this.watchers.get(filename);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filename);
      this.logger.log(`[LIVE LOGS] Stopped watching ${filename}`);
    }
  }

  stopAllWatchers(): void {
    this.watchers.forEach((watcher, filename) => {
      watcher.close();
      this.logger.log(`[LIVE LOGS] Stopped watching ${filename}`);
    });
    this.watchers.clear();
  }

  onModuleDestroy(): void {
    this.stopAllWatchers();
  }
}
