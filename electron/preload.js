const { contextBridge, ipcRenderer } = require('electron');

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('freezeGuardAPI', {
  freezeTarget: {
    add: (targetPath) => ipcRenderer.invoke('freeze-target:add', targetPath),
    remove: (targetId) => ipcRenderer.invoke('freeze-target:remove', targetId),
    freeze: (targetId) => ipcRenderer.invoke('freeze-target:freeze', targetId),
    restore: (targetId) => ipcRenderer.invoke('freeze-target:restore', targetId),
    getAll: () => ipcRenderer.invoke('freeze-target:get-all'),
  },
  
  fileSystem: {
    selectFolder: () => ipcRenderer.invoke('filesystem:select-folder'),
    getDrives: () => ipcRenderer.invoke('filesystem:get-drives'),
  },
  
  config: {
    get: (key) => ipcRenderer.invoke('config:get', key),
    set: (key, value) => ipcRenderer.invoke('config:set', key, value),
    getAll: () => ipcRenderer.invoke('config:get-all'),
    reset: () => ipcRenderer.invoke('config:reset'),
    export: () => ipcRenderer.invoke('config:export'),
    import: (configJson) => ipcRenderer.invoke('config:import', configJson),
  },
  
  on: (channel, callback) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },
  
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});