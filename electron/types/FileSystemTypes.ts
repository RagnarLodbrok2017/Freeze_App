export interface DriveInfo {
  path: string;
  label: string;
  type: 'system' | 'local' | 'removable' | 'network' | 'unknown';
  totalSize: number;
  freeSize: number;
  isReady: boolean;
  fileSystem?: string;
}

export interface FileChange {
  type: FileChangeType;
  path: string;
  timestamp: Date;
  size: number;
  oldSize?: number;
  permissions?: string;
}

export type FileChangeType = 'created' | 'modified' | 'deleted' | 'moved' | 'renamed';

export interface FileSystemStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  lastModified: Date;
  permissions: string;
  owner?: string;
  group?: string;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  modified: Date;
  permissions: string;
  hidden: boolean;
}

export interface FileSystemOperation {
  id: string;
  type: 'copy' | 'move' | 'delete' | 'create';
  source: string;
  destination?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

export interface WatcherOptions {
  ignored?: string | RegExp | (string | RegExp)[];
  persistent?: boolean;
  ignoreInitial?: boolean;
  followSymlinks?: boolean;
  depth?: number;
  awaitWriteFinish?: {
    stabilityThreshold: number;
    pollInterval: number;
  };
}

export interface PathInfo {
  exists: boolean;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
  size: number;
  permissions: string;
  owner?: string;
  group?: string;
  created: Date;
  modified: Date;
  accessed: Date;
}

export interface DiskUsage {
  total: number;
  used: number;
  free: number;
  percentage: number;
}

export interface FileSystemError {
  code: string;
  message: string;
  path: string;
  operation: string;
  timestamp: Date;
}

export interface BackupMetadata {
  id: string;
  sourcePath: string;
  backupPath: string;
  createdAt: Date;
  size: number;
  fileCount: number;
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
}

export interface SyncOptions {
  deleteExtraneous?: boolean;
  preserveTimestamps?: boolean;
  preservePermissions?: boolean;
  followSymlinks?: boolean;
  excludePatterns?: string[];
  dryRun?: boolean;
}

export interface SyncResult {
  filesCreated: number;
  filesUpdated: number;
  filesDeleted: number;
  directoriesCreated: number;
  directoriesDeleted: number;
  bytesTransferred: number;
  errors: FileSystemError[];
  duration: number;
}