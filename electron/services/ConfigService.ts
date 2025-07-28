import Store from 'electron-store';
import { Logger } from '../utils/Logger';

interface ConfigSchema {
  snapshotDirectory: string;
  maxSnapshotSize: number;
  autoCleanupDays: number;
  enableNotifications: boolean;
  minimizeToTray: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  performanceMode: 'balanced' | 'performance' | 'efficiency';
  excludePatterns: string[];
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupRetentionDays: number;
  maxConcurrentOperations: number;
}

export class ConfigService {
  private store: Store<ConfigSchema>;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ConfigService');
    
    this.store = new Store<ConfigSchema>({
      name: 'freeze-guard-config',
      defaults: {
        snapshotDirectory: '',
        maxSnapshotSize: 10 * 1024 * 1024 * 1024, // 10GB
        autoCleanupDays: 30,
        enableNotifications: true,
        minimizeToTray: true,
        theme: 'system',
        language: 'en',
        performanceMode: 'balanced',
        excludePatterns: [
          '**/.git/**',
          '**/.svn/**',
          '**/.hg/**',
          '**/node_modules/**',
          '**/.DS_Store',
          '**/Thumbs.db',
          '**/*.tmp',
          '**/*.temp',
          '**/System Volume Information/**',
          '**/$RECYCLE.BIN/**',
        ],
        compressionEnabled: true,
        encryptionEnabled: false,
        backupRetentionDays: 7,
        maxConcurrentOperations: 3,
      },
      schema: {
        snapshotDirectory: {
          type: 'string',
          default: '',
        },
        maxSnapshotSize: {
          type: 'number',
          minimum: 1024 * 1024, // 1MB minimum
          maximum: 100 * 1024 * 1024 * 1024, // 100GB maximum
        },
        autoCleanupDays: {
          type: 'number',
          minimum: 1,
          maximum: 365,
        },
        enableNotifications: {
          type: 'boolean',
        },
        minimizeToTray: {
          type: 'boolean',
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'system'],
        },
        language: {
          type: 'string',
          pattern: '^[a-z]{2}$',
        },
        performanceMode: {
          type: 'string',
          enum: ['balanced', 'performance', 'efficiency'],
        },
        excludePatterns: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        compressionEnabled: {
          type: 'boolean',
        },
        encryptionEnabled: {
          type: 'boolean',
        },
        backupRetentionDays: {
          type: 'number',
          minimum: 1,
          maximum: 365,
        },
        maxConcurrentOperations: {
          type: 'number',
          minimum: 1,
          maximum: 10,
        },
      },
    });

    this.initializeDefaults();
    this.logger.info('ConfigService initialized');
  }

  private initializeDefaults(): void {
    // Set default snapshot directory if not set
    if (!this.store.get('snapshotDirectory')) {
      const defaultPath = this.getDefaultSnapshotDirectory();
      this.store.set('snapshotDirectory', defaultPath);
      this.logger.info(`Set default snapshot directory: ${defaultPath}`);
    }
  }

  private getDefaultSnapshotDirectory(): string {
    const os = require('os');
    const path = require('path');
    
    switch (process.platform) {
      case 'win32':
        return path.join(os.homedir(), 'Documents', 'FreezeGuard', 'Snapshots');
      case 'darwin':
        return path.join(os.homedir(), 'Documents', 'FreezeGuard', 'Snapshots');
      default:
        return path.join(os.homedir(), '.freeze-guard', 'snapshots');
    }
  }

  public get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    try {
      return this.store.get(key);
    } catch (error) {
      this.logger.error(`Failed to get config value for ${key}: ${error}`);
      throw error;
    }
  }

  public set<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]): void {
    try {
      this.store.set(key, value);
      this.logger.debug(`Config updated: ${key} = ${JSON.stringify(value)}`);
    } catch (error) {
      this.logger.error(`Failed to set config value for ${key}: ${error}`);
      throw error;
    }
  }

  public getAll(): ConfigSchema {
    try {
      return this.store.store;
    } catch (error) {
      this.logger.error(`Failed to get all config values: ${error}`);
      throw error;
    }
  }

  public reset(): void {
    try {
      this.store.clear();
      this.initializeDefaults();
      this.logger.info('Configuration reset to defaults');
    } catch (error) {
      this.logger.error(`Failed to reset configuration: ${error}`);
      throw error;
    }
  }

  public has(key: keyof ConfigSchema): boolean {
    return this.store.has(key);
  }

  public delete(key: keyof ConfigSchema): void {
    try {
      this.store.delete(key);
      this.logger.debug(`Config key deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete config key ${key}: ${error}`);
      throw error;
    }
  }

  public getConfigPath(): string {
    return this.store.path;
  }

  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.getAll();

    // Validate snapshot directory
    if (!config.snapshotDirectory || config.snapshotDirectory.trim() === '') {
      errors.push('Snapshot directory cannot be empty');
    }

    // Validate max snapshot size
    if (config.maxSnapshotSize < 1024 * 1024) {
      errors.push('Maximum snapshot size must be at least 1MB');
    }

    // Validate auto cleanup days
    if (config.autoCleanupDays < 1 || config.autoCleanupDays > 365) {
      errors.push('Auto cleanup days must be between 1 and 365');
    }

    // Validate performance mode
    if (!['balanced', 'performance', 'efficiency'].includes(config.performanceMode)) {
      errors.push('Invalid performance mode');
    }

    // Validate theme
    if (!['light', 'dark', 'system'].includes(config.theme)) {
      errors.push('Invalid theme selection');
    }

    // Validate language code
    if (!/^[a-z]{2}$/.test(config.language)) {
      errors.push('Language must be a valid 2-letter code');
    }

    // Validate backup retention days
    if (config.backupRetentionDays < 1 || config.backupRetentionDays > 365) {
      errors.push('Backup retention days must be between 1 and 365');
    }

    // Validate max concurrent operations
    if (config.maxConcurrentOperations < 1 || config.maxConcurrentOperations > 10) {
      errors.push('Max concurrent operations must be between 1 and 10');
    }

    const isValid = errors.length === 0;
    
    if (!isValid) {
      this.logger.warn(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return { isValid, errors };
  }

  public exportConfig(): string {
    try {
      const config = this.getAll();
      return JSON.stringify(config, null, 2);
    } catch (error) {
      this.logger.error(`Failed to export configuration: ${error}`);
      throw error;
    }
  }

  public importConfig(configJson: string): void {
    try {
      const config = JSON.parse(configJson) as Partial<ConfigSchema>;
      
      // Validate imported config
      for (const [key, value] of Object.entries(config)) {
        if (key in this.store.store) {
          this.set(key as keyof ConfigSchema, value);
        }
      }
      
      // Validate the final configuration
      const validation = this.validateConfig();
      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }
      
      this.logger.info('Configuration imported successfully');
    } catch (error) {
      this.logger.error(`Failed to import configuration: ${error}`);
      throw error;
    }
  }

  public getPerformanceSettings(): {
    maxConcurrentOperations: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    excludePatterns: string[];
  } {
    return {
      maxConcurrentOperations: this.get('maxConcurrentOperations'),
      compressionEnabled: this.get('compressionEnabled'),
      encryptionEnabled: this.get('encryptionEnabled'),
      excludePatterns: this.get('excludePatterns'),
    };
  }

  public updatePerformanceMode(mode: 'balanced' | 'performance' | 'efficiency'): void {
    this.set('performanceMode', mode);
    
    // Adjust settings based on performance mode
    switch (mode) {
      case 'performance':
        this.set('maxConcurrentOperations', 5);
        this.set('compressionEnabled', false);
        break;
      case 'efficiency':
        this.set('maxConcurrentOperations', 1);
        this.set('compressionEnabled', true);
        break;
      case 'balanced':
      default:
        this.set('maxConcurrentOperations', 3);
        this.set('compressionEnabled', true);
        break;
    }
    
    this.logger.info(`Performance mode updated to: ${mode}`);
  }
}