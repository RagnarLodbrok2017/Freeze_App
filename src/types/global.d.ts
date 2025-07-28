export interface FreezeGuardAPI {
  // Freeze Target Operations
  freezeTarget: {
    add: (targetPath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    remove: (targetId: string) => Promise<{ success: boolean; error?: string }>;
    freeze: (targetId: string) => Promise<{ success: boolean; error?: string }>;
    restore: (targetId: string) => Promise<{ success: boolean; error?: string }>;
    getAll: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  };
  
  // File System Operations
  fileSystem: {
    selectFolder: () => Promise<{ success: boolean; data?: string; error?: string }>;
    selectMultipleFolders: () => Promise<{ success: boolean; data?: string[]; error?: string }>;
    selectPartitions: () => Promise<{ success: boolean; data?: string[]; error?: string }>;
    getDrives: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  };
  
  // Configuration
  config: {
    get: (key: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    set: (key: string, value: any) => Promise<{ success: boolean; error?: string }>;
    getAll: () => Promise<{ success: boolean; data?: any; error?: string }>;
    reset: () => Promise<{ success: boolean; error?: string }>;
    export: () => Promise<{ success: boolean; data?: string; error?: string }>;
    import: (configJson: string) => Promise<{ success: boolean; error?: string }>;
  };
  
  // Event Listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    freezeGuardAPI: FreezeGuardAPI;
  }
}

export {};