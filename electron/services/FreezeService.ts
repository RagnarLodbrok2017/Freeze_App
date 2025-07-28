import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileSystemService } from './FileSystemService';
import { ConfigService } from './ConfigService';
import { Logger } from '../utils/Logger';
import { FreezeTarget, FreezeStatus, SnapshotMetadata } from '../types/FreezeTypes';

export class FreezeService extends EventEmitter {
  private targets: Map<string, FreezeTarget> = new Map();
  private logger: Logger;
  private snapshotDir: string;

  constructor(
    private fileSystemService: FileSystemService,
    private configService: ConfigService
  ) {
    super();
    this.logger = new Logger('FreezeService');
    this.snapshotDir = this.configService.get('snapshotDirectory') || 
                      path.join(process.cwd(), 'snapshots');
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      await fs.mkdir(this.snapshotDir, { recursive: true });
      await this.loadExistingTargets();
      this.logger.info('FreezeService initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize FreezeService: ${error}`);
      throw error;
    }
  }

  public async addTarget(targetPath: string): Promise<FreezeTarget> {
    try {
      // Validate target path
      const stats = await fs.stat(targetPath);
      const isDirectory = stats.isDirectory();
      
      // Check if target already exists
      for (const target of this.targets.values()) {
        if (target.path === targetPath) {
          throw new Error('Target already exists');
        }
      }

      const target: FreezeTarget = {
        id: uuidv4(),
        path: targetPath,
        name: path.basename(targetPath),
        type: isDirectory ? 'folder' : 'partition',
        status: FreezeStatus.ACTIVE,
        createdAt: new Date(),
        lastFrozenAt: null,
        lastRestoredAt: null,
        size: await this.calculateTargetSize(targetPath),
        changeCount: 0,
        snapshotPath: null,
      };

      this.targets.set(target.id, target);
      await this.saveTargetsState();
      
      // Start monitoring the target
      this.fileSystemService.startWatching(target.id, targetPath, (changes) => {
        this.handleTargetChanges(target.id, changes);
      });

      this.emit('targetAdded', target);
      this.logger.info(`Target added: ${target.name} (${target.id})`);
      
      return target;
    } catch (error) {
      this.logger.error(`Failed to add target: ${error}`);
      throw error;
    }
  }

  public async removeTarget(targetId: string): Promise<void> {
    try {
      const target = this.targets.get(targetId);
      if (!target) {
        throw new Error('Target not found');
      }

      // Stop monitoring
      this.fileSystemService.stopWatching(targetId);

      // Clean up snapshot if exists
      if (target.snapshotPath) {
        await this.cleanupSnapshot(target.snapshotPath);
      }

      this.targets.delete(targetId);
      await this.saveTargetsState();

      this.emit('targetRemoved', targetId);
      this.logger.info(`Target removed: ${target.name} (${targetId})`);
    } catch (error) {
      this.logger.error(`Failed to remove target: ${error}`);
      throw error;
    }
  }

  public async freezeTarget(targetId: string): Promise<void> {
    try {
      const target = this.targets.get(targetId);
      if (!target) {
        throw new Error('Target not found');
      }

      if (target.status === FreezeStatus.FROZEN) {
        throw new Error('Target is already frozen');
      }

      this.updateTargetStatus(targetId, FreezeStatus.FREEZING);

      // Create snapshot
      const snapshotPath = await this.createSnapshot(target);
      
      // Update target
      target.snapshotPath = snapshotPath;
      target.lastFrozenAt = new Date();
      target.changeCount = 0;
      
      this.updateTargetStatus(targetId, FreezeStatus.FROZEN);
      await this.saveTargetsState();

      this.emit('targetFrozen', target);
      this.logger.info(`Target frozen: ${target.name} (${targetId})`);
    } catch (error) {
      this.updateTargetStatus(targetId, FreezeStatus.ACTIVE);
      this.logger.error(`Failed to freeze target: ${error}`);
      throw error;
    }
  }

  public async restoreTarget(targetId: string): Promise<void> {
    try {
      const target = this.targets.get(targetId);
      if (!target) {
        throw new Error('Target not found');
      }

      if (target.status !== FreezeStatus.FROZEN) {
        throw new Error('Target is not frozen');
      }

      if (!target.snapshotPath) {
        throw new Error('No snapshot available for restoration');
      }

      this.updateTargetStatus(targetId, FreezeStatus.RESTORING);

      // Restore from snapshot
      await this.restoreFromSnapshot(target);
      
      // Update target
      target.lastRestoredAt = new Date();
      target.changeCount = 0;
      
      this.updateTargetStatus(targetId, FreezeStatus.ACTIVE);
      await this.saveTargetsState();

      this.emit('targetRestored', target);
      this.logger.info(`Target restored: ${target.name} (${targetId})`);
    } catch (error) {
      this.updateTargetStatus(targetId, FreezeStatus.FROZEN);
      this.logger.error(`Failed to restore target: ${error}`);
      throw error;
    }
  }

  public async getAllTargets(): Promise<FreezeTarget[]> {
    return Array.from(this.targets.values());
  }

  public getTarget(targetId: string): FreezeTarget | undefined {
    return this.targets.get(targetId);
  }

  private async createSnapshot(target: FreezeTarget): Promise<string> {
    const snapshotId = `${target.id}_${Date.now()}`;
    const snapshotPath = path.join(this.snapshotDir, snapshotId);
    
    await fs.mkdir(snapshotPath, { recursive: true });
    
    // Create metadata
    const metadata: SnapshotMetadata = {
      targetId: target.id,
      targetPath: target.path,
      createdAt: new Date(),
      size: target.size,
      fileCount: await this.countFiles(target.path),
    };
    
    await fs.writeFile(
      path.join(snapshotPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Copy target content to snapshot
    await this.copyDirectory(target.path, path.join(snapshotPath, 'content'));
    
    this.logger.info(`Snapshot created: ${snapshotPath}`);
    return snapshotPath;
  }

  private async restoreFromSnapshot(target: FreezeTarget): Promise<void> {
    if (!target.snapshotPath) {
      throw new Error('No snapshot path available');
    }

    const contentPath = path.join(target.snapshotPath, 'content');
    
    // Remove current content
    await this.removeDirectory(target.path);
    
    // Restore from snapshot
    await this.copyDirectory(contentPath, target.path);
    
    this.logger.info(`Target restored from snapshot: ${target.snapshotPath}`);
  }

  private async copyDirectory(source: string, destination: string): Promise<void> {
    await fs.mkdir(destination, { recursive: true });
    
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }

  private async removeDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(`Failed to remove directory: ${error}`);
    }
  }

  private async calculateTargetSize(targetPath: string): Promise<number> {
    try {
      const stats = await fs.stat(targetPath);
      
      if (stats.isFile()) {
        return stats.size;
      }
      
      let totalSize = 0;
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(targetPath, entry.name);
        if (entry.isDirectory()) {
          totalSize += await this.calculateTargetSize(entryPath);
        } else {
          const entryStats = await fs.stat(entryPath);
          totalSize += entryStats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      this.logger.warn(`Failed to calculate size for ${targetPath}: ${error}`);
      return 0;
    }
  }

  private async countFiles(dirPath: string): Promise<number> {
    try {
      let count = 0;
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          count += await this.countFiles(path.join(dirPath, entry.name));
        } else {
          count++;
        }
      }
      
      return count;
    } catch (error) {
      return 0;
    }
  }

  private handleTargetChanges(targetId: string, changes: any[]): void {
    const target = this.targets.get(targetId);
    if (!target) return;

    target.changeCount += changes.length;
    this.emit('targetChanged', { targetId, changes, changeCount: target.changeCount });
  }

  private updateTargetStatus(targetId: string, status: FreezeStatus): void {
    const target = this.targets.get(targetId);
    if (target) {
      target.status = status;
      this.emit('targetStatusChanged', { targetId, status });
    }
  }

  private async loadExistingTargets(): Promise<void> {
    try {
      const stateFile = path.join(this.snapshotDir, 'targets.json');
      const data = await fs.readFile(stateFile, 'utf-8');
      const targets: FreezeTarget[] = JSON.parse(data);
      
      for (const target of targets) {
        this.targets.set(target.id, target);
        
        // Restart monitoring for active targets
        if (target.status === FreezeStatus.ACTIVE || target.status === FreezeStatus.FROZEN) {
          this.fileSystemService.startWatching(target.id, target.path, (changes) => {
            this.handleTargetChanges(target.id, changes);
          });
        }
      }
      
      this.logger.info(`Loaded ${targets.length} existing targets`);
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      this.logger.info('No existing targets found, starting fresh');
    }
  }

  private async saveTargetsState(): Promise<void> {
    try {
      const stateFile = path.join(this.snapshotDir, 'targets.json');
      const targets = Array.from(this.targets.values());
      await fs.writeFile(stateFile, JSON.stringify(targets, null, 2));
    } catch (error) {
      this.logger.error(`Failed to save targets state: ${error}`);
    }
  }

  private async cleanupSnapshot(snapshotPath: string): Promise<void> {
    try {
      await fs.rm(snapshotPath, { recursive: true, force: true });
      this.logger.info(`Snapshot cleaned up: ${snapshotPath}`);
    } catch (error) {
      this.logger.warn(`Failed to cleanup snapshot: ${error}`);
    }
  }

  public async cleanup(): Promise<void> {
    try {
      // Stop all watchers
      for (const targetId of this.targets.keys()) {
        this.fileSystemService.stopWatching(targetId);
      }
      
      // Save final state
      await this.saveTargetsState();
      
      this.logger.info('FreezeService cleanup completed');
    } catch (error) {
      this.logger.error(`FreezeService cleanup failed: ${error}`);
    }
  }
}