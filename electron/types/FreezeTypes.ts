export enum FreezeStatus {
  ACTIVE = 'active',
  FREEZING = 'freezing',
  FROZEN = 'frozen',
  RESTORING = 'restoring',
  ERROR = 'error',
}

export interface FreezeTarget {
  id: string;
  path: string;
  name: string;
  type: 'folder' | 'partition';
  status: FreezeStatus;
  createdAt: Date;
  lastFrozenAt: Date | null;
  lastRestoredAt: Date | null;
  size: number;
  changeCount: number;
  snapshotPath: string | null;
}

export interface SnapshotMetadata {
  targetId: string;
  targetPath: string;
  createdAt: Date;
  size: number;
  fileCount: number;
  checksum?: string;
  compressionRatio?: number;
  encrypted?: boolean;
}

export interface FreezeOperation {
  id: string;
  targetId: string;
  type: 'freeze' | 'restore';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  progress: number;
  error?: string;
  estimatedTimeRemaining?: number;
}

export interface FreezeStatistics {
  totalTargets: number;
  frozenTargets: number;
  activeTargets: number;
  totalSnapshotSize: number;
  totalChanges: number;
  lastOperation?: Date;
  operationHistory: FreezeOperation[];
}

export interface FreezeTargetChange {
  targetId: string;
  changes: FileChange[];
  changeCount: number;
  timestamp: Date;
}

export interface FileChange {
  type: 'created' | 'modified' | 'deleted';
  path: string;
  timestamp: Date;
  size: number;
  oldSize?: number;
}

export interface RestoreOptions {
  targetId: string;
  selective?: boolean;
  selectedPaths?: string[];
  createBackup?: boolean;
  verifyIntegrity?: boolean;
}

export interface FreezeOptions {
  targetId: string;
  compression?: boolean;
  encryption?: boolean;
  excludePatterns?: string[];
  verifyIntegrity?: boolean;
}

export interface TargetValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  size: number;
  fileCount: number;
  permissions: string;
}

export interface SnapshotInfo {
  id: string;
  targetId: string;
  path: string;
  size: number;
  createdAt: Date;
  metadata: SnapshotMetadata;
  isValid: boolean;
}

export interface FreezeProgress {
  targetId: string;
  operation: 'freeze' | 'restore';
  progress: number;
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  bytesProcessed: number;
  totalBytes: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

export interface FreezeEvent {
  type: 'targetAdded' | 'targetRemoved' | 'targetFrozen' | 'targetRestored' | 'targetChanged' | 'operationProgress' | 'error';
  targetId?: string;
  data?: any;
  timestamp: Date;
}