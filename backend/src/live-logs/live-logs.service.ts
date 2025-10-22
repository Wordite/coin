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
      if (!fs.existsSync(this.logsDir)) {
        return [];
      }
      
      const allFiles = fs.readdirSync(this.logsDir);
      const logFiles = allFiles
        .filter(file => file.endsWith('.log'))
        .map(file => path.join(this.logsDir, file));
      
      return logFiles;
    } catch (error) {
      return [];
    }
  }

  async getLastLines(filename: string, lines: number = 1000): Promise<string[]> {
    try {
      const filePath = path.resolve(filename);
      
      // Security check - ensure file is in logs directory
      if (!filePath.startsWith(this.logsDir)) {
        throw new Error('Access denied: File outside logs directory');
      }

      if (!fs.existsSync(filePath)) {
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const allLines = content.split('\n').filter(line => line.trim());
      const lastLines = allLines.slice(-lines);
      
      return lastLines;
    } catch (error) {
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
          // Silent error handling
        }
      });

      watcher.on('error', (error) => {
        // Silent error handling
      });

      this.watchers.set(filename, watcher);
    } catch (error) {
      // Silent error handling
    }
  }

  stopWatching(filename: string): void {
    const watcher = this.watchers.get(filename);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filename);
    }
  }

  stopAllWatchers(): void {
    this.watchers.forEach((watcher) => {
      watcher.close();
    });
    this.watchers.clear();
  }

  onModuleDestroy(): void {
    this.stopAllWatchers();
  }
}
