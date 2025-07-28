import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
interface FreezeGuardAPI {
  // Freeze Target Operations
  freezeTarget: {
    add: (targetPath: string) => Promise<any>;
    remove: (targetId: string) => Promise<any>;
    freeze: (targetId: string) => Promise<any>;
    restore: (targetId: string) => Promise<any>;
    getAll: () => Promise<any>;
  };
  
  // File System Operations
  fileSystem: {
    selectFolder: () => Promise<any>;
    selectMultipleFolders: () => Promise<any>;
    selectPartitions: () => Promise<any>;
    getDrives: () => Promise<any>;
  };
  
  // Configuration
  config: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<any>;
    getAll: () => Promise<any>;
    reset: () => Promise<any>;
    export: () => Promise<any>;
    import: (configJson: string) => Promise<any>;
  };
  
  // Event Listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('freezeGuardAPI', {
  freezeTarget: {
    add: (targetPath: string) => ipcRenderer.invoke('freeze-target:add', targetPath),
    remove: (targetId: string) => ipcRenderer.invoke('freeze-target:remove', targetId),
    freeze: (targetId: string) => ipcRenderer.invoke('freeze-target:freeze', targetId),
    restore: (targetId: string) => ipcRenderer.invoke('freeze-target:restore', targetId),
    getAll: () => ipcRenderer.invoke('freeze-target:get-all'),
  },
  
  fileSystem: {
    selectFolder: () => ipcRenderer.invoke('filesystem:select-folder'),
    selectMultipleFolders: () => ipcRenderer.invoke('filesystem:select-multiple-folders'),
    selectPartitions: () => ipcRenderer.invoke('filesystem:select-partitions'),
    getDrives: () => ipcRenderer.invoke('filesystem:get-drives'),
  },
  
  config: {
    get: (key: string) => ipcRenderer.invoke('config:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('config:set', key, value),
    getAll: () => ipcRenderer.invoke('config:get-all'),
    reset: () => ipcRenderer.invoke('config:reset'),
    export: () => ipcRenderer.invoke('config:export'),
    import: (configJson: string) => ipcRenderer.invoke('config:import', configJson),
  },
  
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
} as FreezeGuardAPI);

// Declare the global interface for TypeScript
declare global {
  interface Window {
    freezeGuardAPI: FreezeGuardAPI;
  }
}