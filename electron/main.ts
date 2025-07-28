import { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import { FreezeService } from './services/FreezeService';
import { FileSystemService } from './services/FileSystemService';
import { ConfigService } from './services/ConfigService';
import { Logger } from './utils/Logger';

class FreezeGuardApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private isQuitting: boolean = false;
  private freezeService: FreezeService;
  private fileSystemService: FileSystemService;
  private configService: ConfigService;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('FreezeGuardApp');
    this.configService = new ConfigService();
    this.fileSystemService = new FileSystemService();
    this.freezeService = new FreezeService(this.fileSystemService, this.configService);
    
    this.initializeApp();
  }

  private initializeApp(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupIpcHandlers();
      this.setupMenu();
      this.setupTray();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        // Don't quit the app when all windows are closed if tray is enabled
        const minimizeToTray = this.configService.get('minimizeToTray') ?? true;
        if (!minimizeToTray) {
          app.quit();
        }
      }
    });

    app.on('before-quit', async () => {
      await this.cleanup();
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'hiddenInset',
      show: false,
      icon: path.join(__dirname, '../assets/icon.ico'),
      fullscreen: true,
    });

    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3001');
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle minimize to tray
    this.mainWindow.on('minimize', (event) => {
      const minimizeToTray = this.configService.get('minimizeToTray') ?? true;
      if (minimizeToTray) {
        event.preventDefault();
        this.hideToTray();
      }
    });

    this.mainWindow.on('close', (event) => {
      const minimizeToTray = this.configService.get('minimizeToTray') ?? true;
      if (minimizeToTray && !this.isQuitting) {
        event.preventDefault();
        this.hideToTray();
      }
    });
  }

  private setupIpcHandlers(): void {
    // Freeze Target Management
    ipcMain.handle('freeze-target:add', async (_, targetPath: string) => {
      try {
        const result = await this.freezeService.addTarget(targetPath);
        this.logger.info(`Target added: ${targetPath}`);
        return { success: true, data: result };
      } catch (error) {
        this.logger.error(`Failed to add target: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('freeze-target:remove', async (_, targetId: string) => {
      try {
        await this.freezeService.removeTarget(targetId);
        this.logger.info(`Target removed: ${targetId}`);
        return { success: true };
      } catch (error) {
        this.logger.error(`Failed to remove target: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('freeze-target:freeze', async (_, targetId: string) => {
      try {
        await this.freezeService.freezeTarget(targetId);
        this.logger.info(`Target frozen: ${targetId}`);
        return { success: true };
      } catch (error) {
        this.logger.error(`Failed to freeze target: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('freeze-target:restore', async (_, targetId: string) => {
      try {
        await this.freezeService.restoreTarget(targetId);
        this.logger.info(`Target restored: ${targetId}`);
        return { success: true };
      } catch (error) {
        this.logger.error(`Failed to restore target: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('freeze-target:get-all', async () => {
      try {
        const targets = await this.freezeService.getAllTargets();
        return { success: true, data: targets };
      } catch (error) {
        this.logger.error(`Failed to get targets: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    // File System Operations
    ipcMain.handle('filesystem:select-folder', async () => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow!, {
          properties: ['openDirectory'],
          title: 'Select Folder to Freeze'
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
          return { success: true, data: result.filePaths[0] };
        }
        
        return { success: false, error: 'No folder selected' };
      } catch (error) {
        this.logger.error(`Failed to select folder: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('filesystem:get-drives', async () => {
      try {
        const drives = await this.fileSystemService.getAvailableDrives();
        return { success: true, data: drives };
      } catch (error) {
        this.logger.error(`Failed to get drives: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    // Configuration
    ipcMain.handle('config:get', async (_, key: string) => {
      try {
        const value = this.configService.get(key as any);
        return { success: true, data: value };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('config:set', async (_, key: string, value: any) => {
      try {
        this.configService.set(key as any, value);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
    
    ipcMain.handle('config:get-all', async () => {
      try {
        const allSettings = this.configService.getAll();
        return { success: true, data: allSettings };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
    
    ipcMain.handle('config:reset', async () => {
      try {
        this.configService.reset();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
    
    ipcMain.handle('config:export', async () => {
      try {
        const configData = this.configService.exportConfig();
        return { success: true, data: configData };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
    
    ipcMain.handle('config:import', async (_, configJson: string) => {
      try {
        this.configService.importConfig(configJson);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
  }

  private mainMenu: Menu | null = null;
  private actionMenuItems = {
    freezeAll: null as Electron.MenuItem | null,
    restoreAll: null as Electron.MenuItem | null,
    addFolder: null as Electron.MenuItem | null
  };

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Add Folder',
            accelerator: 'CmdOrCtrl+O',
            id: 'add-folder',
            click: () => {
              this.mainWindow?.webContents.send('menu:add-folder');
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.isQuitting = true;
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Actions',
        submenu: [
          {
            label: 'Freeze All',
            accelerator: 'CmdOrCtrl+F',
            id: 'freeze-all',
            click: () => {
              this.mainWindow?.webContents.send('menu:freeze-all');
            }
          },
          {
            label: 'Restore All',
            accelerator: 'CmdOrCtrl+R',
            id: 'restore-all',
            click: () => {
              this.mainWindow?.webContents.send('menu:restore-all');
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Freeze Guard',
            click: () => {
              dialog.showMessageBox(this.mainWindow!, {
                type: 'info',
                title: 'About Freeze Guard',
                message: 'Freeze Guard v1.0.0',
                detail: 'Professional partition and folder state management application.'
              });
            }
          }
        ]
      }
    ];

    this.mainMenu = Menu.buildFromTemplate(template);
    // Remove the menu bar by setting it to null
    Menu.setApplicationMenu(null);

    // Store references to menu items we need to update
    this.actionMenuItems.freezeAll = this.mainMenu.getMenuItemById('freeze-all');
    this.actionMenuItems.restoreAll = this.mainMenu.getMenuItemById('restore-all');
    this.actionMenuItems.addFolder = this.mainMenu.getMenuItemById('add-folder');

    // Setup listeners for freeze status changes to update menu
    this.freezeService.on('targetStatusChanged', ({ targetId, status }) => {
      this.updateMenuBasedOnFreezeStatus();
    });

    // Initial menu update
    this.updateMenuBasedOnFreezeStatus();
  }

  private async updateMenuBasedOnFreezeStatus(): Promise<void> {
    try {
      const targets = await this.freezeService.getAllTargets();
      const hasFrozenTargets = targets.some(target => target.status === 'frozen');

      // Update menu items based on frozen status
      if (this.actionMenuItems.freezeAll) {
        this.actionMenuItems.freezeAll.enabled = !hasFrozenTargets;
      }

      if (this.actionMenuItems.restoreAll) {
        this.actionMenuItems.restoreAll.enabled = hasFrozenTargets;
      }

      // Optionally disable adding folders while frozen targets exist
      if (this.actionMenuItems.addFolder) {
        this.actionMenuItems.addFolder.enabled = !hasFrozenTargets;
      }

      this.logger.info(`Menu updated based on freeze status: frozen targets = ${hasFrozenTargets}`);
    } catch (error) {
      this.logger.error(`Failed to update menu based on freeze status: ${error}`);
    }
  }

  private setupTray(): void {
    try {
      // Create tray icon using the ICO file
      let trayIcon: nativeImage;
      
      // Try ICO file first, then fallback to PNG files
      const iconPaths = [
        path.join(__dirname, '../assets/tray-icon.ico'),
        path.join(__dirname, '../assets/icon.ico'),
        path.join(__dirname, '../assets/tray-icon.png'),
        path.join(__dirname, '../assets/icon.png')
      ];
      
      let iconFound = false;
      for (const iconPath of iconPaths) {
        try {
          const fs = require('fs');
          if (fs.existsSync(iconPath)) {
            trayIcon = nativeImage.createFromPath(iconPath);
            if (!trayIcon.isEmpty()) {
              // Resize icon for system tray (16x16 is standard for Windows tray)
              trayIcon = trayIcon.resize({ width: 16, height: 16 });
              iconFound = true;
              this.logger.info(`Using tray icon: ${iconPath}`);
              break;
            }
          }
        } catch (error) {
          // Continue to next icon path
        }
      }
      
      if (!iconFound) {
        this.logger.error('No tray icon found! Creating fallback icon.');
        // Create a simple fallback icon if no file found
        trayIcon = this.createSimpleTrayIcon();
      }
      
      this.tray = new Tray(trayIcon);
      this.tray.setToolTip('Freeze Guard - Partition and Folder State Management');
      
      // Ensure tray is visible (some Windows versions hide tray icons by default)
      this.tray.setIgnoreDoubleClickEvents(false);
      
      // Create tray context menu
      this.updateTrayMenu();
      
      // Handle tray click events
      this.tray.on('click', () => {
        this.showMainWindow();
      });
      
      this.tray.on('double-click', () => {
        this.showMainWindow();
      });
      
      // Listen for freeze status changes to update tray menu
      this.freezeService.on('targetStatusChanged', () => {
        this.updateTrayMenu();
      });
      
      this.logger.info('System tray initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to setup system tray: ${error}`);
    }
  }

  private createSimpleTrayIcon(): nativeImage {
    // Create a simple 16x16 icon for the system tray
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4); // RGBA
    
    // Fill with a simple pattern (blue square with white border)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
          // White border
          buffer[idx] = 255;     // R
          buffer[idx + 1] = 255; // G
          buffer[idx + 2] = 255; // B
          buffer[idx + 3] = 255; // A
        } else if (x >= 2 && x <= size - 3 && y >= 2 && y <= size - 3) {
          // Blue center
          buffer[idx] = 33;      // R
          buffer[idx + 1] = 150; // G
          buffer[idx + 2] = 243; // B
          buffer[idx + 3] = 255; // A
        } else {
          // Transparent
          buffer[idx] = 0;
          buffer[idx + 1] = 0;
          buffer[idx + 2] = 0;
          buffer[idx + 3] = 0;
        }
      }
    }
    
    return nativeImage.createFromBuffer(buffer, { width: size, height: size });
  }

  private async updateTrayMenu(): Promise<void> {
    if (!this.tray) return;
    
    try {
      const targets = await this.freezeService.getAllTargets();
      const hasFrozenTargets = targets.some(target => target.status === 'frozen');
      const frozenCount = targets.filter(target => target.status === 'frozen').length;
      const totalCount = targets.length;
      
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Freeze Guard',
          enabled: false
        },
        {
          label: `Status: ${frozenCount}/${totalCount} frozen`,
          enabled: false
        },
        { type: 'separator' },
        {
          label: 'Show Window',
          click: () => this.showMainWindow()
        },
        { type: 'separator' },
        {
          label: 'Add Folder',
          click: () => {
            this.showMainWindow();
            this.mainWindow?.webContents.send('menu:add-folder');
          }
        },
        {
          label: 'Freeze All',
          enabled: !hasFrozenTargets && totalCount > 0,
          click: () => {
            this.mainWindow?.webContents.send('menu:freeze-all');
          }
        },
        {
          label: 'Restore All',
          enabled: hasFrozenTargets,
          click: () => {
            this.mainWindow?.webContents.send('menu:restore-all');
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          click: () => {
            this.showMainWindow();
            this.mainWindow?.webContents.send('menu:show-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            this.isQuitting = true;
            app.quit();
          }
        }
      ]);
      
      this.tray.setContextMenu(contextMenu);
      
      // Update tray tooltip with current status
      const statusText = hasFrozenTargets 
        ? `Freeze Guard - ${frozenCount} targets frozen`
        : `Freeze Guard - ${totalCount} targets active`;
      this.tray.setToolTip(statusText);
      
    } catch (error) {
      this.logger.error(`Failed to update tray menu: ${error}`);
    }
  }

  private hideToTray(): void {
    if (this.mainWindow) {
      // Hide the window completely from taskbar and Alt+Tab
      this.mainWindow.hide();
      
      // On Windows, also set skip taskbar to ensure it doesn't appear
      if (process.platform === 'win32') {
        this.mainWindow.setSkipTaskbar(true);
      }
      
      this.logger.info('Window hidden to system tray');
    }
  }

  private showMainWindow(): void {
    if (this.mainWindow) {
      // Restore taskbar visibility first
      if (process.platform === 'win32') {
        this.mainWindow.setSkipTaskbar(false);
      }
      
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      
      this.mainWindow.show();
      this.mainWindow.focus();
      
      this.logger.info('Window restored from system tray');
    } else {
      this.createMainWindow();
    }
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.tray) {
        this.tray.destroy();
        this.tray = null;
      }
      await this.freezeService.cleanup();
      this.logger.info('Application cleanup completed');
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error}`);
    }
  }
}

// Initialize the application
new FreezeGuardApp();