import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { Logger } from '../utils/Logger';
import { DriveInfo, FileChange, FileChangeType } from '../types/FileSystemTypes';

export class FileSystemService extends EventEmitter {
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private logger: Logger;

  constructor() {
    super();
    this.logger = new Logger('FileSystemService');
  }

  public async getAvailableDrives(): Promise<DriveInfo[]> {
    const drives: DriveInfo[] = [];
    
    try {
      if (process.platform === 'win32') {
        // Windows: Check drives A-Z
        for (let i = 65; i <= 90; i++) {
          const driveLetter = String.fromCharCode(i);
          const drivePath = `${driveLetter}:\\`;
          
          try {
            const stats = await fs.stat(drivePath);
            if (stats.isDirectory()) {
              const driveInfo = await this.getDriveInfo(drivePath);
              drives.push(driveInfo);
            }
          } catch {
            // Drive not available, skip
          }
        }
      } else {
        // Unix-like systems: Check common mount points
        const mountPoints = ['/'];
        
        try {
          const mounts = await fs.readdir('/mnt');
          mountPoints.push(...mounts.map(mount => `/mnt/${mount}`));
        } catch {
          // /mnt doesn't exist or not accessible
        }
        
        try {
          const media = await fs.readdir('/media');
          mountPoints.push(...media.map(mount => `/media/${mount}`));
        } catch {
          // /media doesn't exist or not accessible
        }
        
        for (const mountPoint of mountPoints) {
          try {
            const stats = await fs.stat(mountPoint);
            if (stats.isDirectory()) {
              const driveInfo = await this.getDriveInfo(mountPoint);
              drives.push(driveInfo);
            }
          } catch {
            // Mount point not available, skip
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to get available drives: ${error}`);
    }
    
    return drives;
  }

  private async getDriveInfo(drivePath: string): Promise<DriveInfo> {
    try {
      const stats = await fs.stat(drivePath);
      
      return {
        path: drivePath,
        label: this.getDriveLabel(drivePath),
        type: this.getDriveType(drivePath) as 'system' | 'local' | 'removable' | 'network' | 'unknown',
        totalSize: 0, // Would need platform-specific code to get actual size
        freeSize: 0,  // Would need platform-specific code to get actual size
        isReady: true,
      };
    } catch (error) {
      this.logger.warn(`Failed to get drive info for ${drivePath}: ${error}`);
      return {
        path: drivePath,
        label: path.basename(drivePath),
        type: 'unknown',
        totalSize: 0,
        freeSize: 0,
        isReady: false,
      };
    }
  }

  private getDriveLabel(drivePath: string): string {
    if (process.platform === 'win32') {
      return `Local Disk (${drivePath.charAt(0)}:)`;
    }
    return path.basename(drivePath) || drivePath;
  }

  private getDriveType(drivePath: string): string {
    if (process.platform === 'win32') {
      const letter = drivePath.charAt(0).toLowerCase();
      if (letter === 'c') return 'system';
      return 'local';
    }
    
    if (drivePath === '/') return 'system';
    if (drivePath.startsWith('/mnt') || drivePath.startsWith('/media')) return 'removable';
    return 'local';
  }

  public startWatching(
    watcherId: string,
    targetPath: string,
    onChange: (changes: FileChange[]) => void
  ): void {
    try {
      // Stop existing watcher if any
      this.stopWatching(watcherId);

      const watcher = chokidar.watch(targetPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
        followSymlinks: false,
        depth: undefined,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      });

      const changes: FileChange[] = [];
      let changeTimeout: NodeJS.Timeout;

      const flushChanges = () => {
        if (changes.length > 0) {
          onChange([...changes]);
          changes.length = 0;
        }
      };

      const addChange = (type: FileChangeType, filePath: string, stats?: fsSync.Stats) => {
        changes.push({
          type,
          path: filePath,
          timestamp: new Date(),
          size: stats?.size || 0,
        });

        // Debounce changes to avoid flooding
        clearTimeout(changeTimeout);
        changeTimeout = setTimeout(flushChanges, 500);
      };

      watcher
        .on('add', (filePath, stats) => addChange('created', filePath, stats))
        .on('change', (filePath, stats) => addChange('modified', filePath, stats))
        .on('unlink', (filePath) => addChange('deleted', filePath))
        .on('addDir', (dirPath, stats) => addChange('created', dirPath, stats))
        .on('unlinkDir', (dirPath) => addChange('deleted', dirPath))
        .on('error', (error) => {
          this.logger.error(`Watcher error for ${watcherId}: ${error}`);
          this.emit('watcherError', { watcherId, error });
        })
        .on('ready', () => {
          this.logger.info(`Started watching: ${targetPath} (${watcherId})`);
        });

      this.watchers.set(watcherId, watcher);
    } catch (error) {
      this.logger.error(`Failed to start watching ${targetPath}: ${error}`);
      throw error;
    }
  }

  public stopWatching(watcherId: string): void {
    const watcher = this.watchers.get(watcherId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(watcherId);
      this.logger.info(`Stopped watching: ${watcherId}`);
    }
  }

  public async validatePath(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  public async getPathInfo(targetPath: string): Promise<{
    exists: boolean;
    isDirectory: boolean;
    isFile: boolean;
    size: number;
    permissions: string;
  }> {
    try {
      const stats = await fs.stat(targetPath);
      
      return {
        exists: true,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
        permissions: stats.mode.toString(8),
      };
    } catch {
      return {
        exists: false,
        isDirectory: false,
        isFile: false,
        size: 0,
        permissions: '',
      };
    }
  }

  public async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      this.logger.info(`Directory created: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Failed to create directory ${dirPath}: ${error}`);
      throw error;
    }
  }

  public async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      this.logger.info(`Directory deleted: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Failed to delete directory ${dirPath}: ${error}`);
      throw error;
    }
  }

  public async copyFile(source: string, destination: string): Promise<void> {
    try {
      await fs.copyFile(source, destination);
      this.logger.debug(`File copied: ${source} -> ${destination}`);
    } catch (error) {
      this.logger.error(`Failed to copy file ${source} -> ${destination}: ${error}`);
      throw error;
    }
  }

  public async moveFile(source: string, destination: string): Promise<void> {
    try {
      await fs.rename(source, destination);
      this.logger.debug(`File moved: ${source} -> ${destination}`);
    } catch (error) {
      this.logger.error(`Failed to move file ${source} -> ${destination}: ${error}`);
      throw error;
    }
  }

  public cleanup(): void {
    // Stop all watchers
    for (const [watcherId, watcher] of this.watchers) {
      watcher.close();
      this.logger.info(`Stopped watcher: ${watcherId}`);
    }
    this.watchers.clear();
    this.logger.info('FileSystemService cleanup completed');
  }
}