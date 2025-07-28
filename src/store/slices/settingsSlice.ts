import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  snapshotDirectory: string;
  maxSnapshotSize: number;
  autoCleanupDays: number;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  performanceMode: 'balanced' | 'performance' | 'efficiency';
  excludePatterns: string[];
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupRetentionDays: number;
  maxConcurrentOperations: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  snapshotDirectory: '',
  maxSnapshotSize: 10 * 1024 * 1024 * 1024, // 10GB
  autoCleanupDays: 30,
  enableNotifications: true,
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
  ],
  compressionEnabled: true,
  encryptionEnabled: false,
  backupRetentionDays: 7,
  maxConcurrentOperations: 3,
  isLoading: false,
  error: null,
};

// Async thunks
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settings: Partial<SettingsState> = {};
      
      // Load all settings from the backend
      const settingsKeys: (keyof SettingsState)[] = [
        'snapshotDirectory',
        'maxSnapshotSize',
        'autoCleanupDays',
        'enableNotifications',
        'theme',
        'language',
        'performanceMode',
        'excludePatterns',
        'compressionEnabled',
        'encryptionEnabled',
        'backupRetentionDays',
        'maxConcurrentOperations',
      ];
      
      for (const key of settingsKeys) {
        try {
          const result = await window.freezeGuardAPI.config.get(key);
          if (result.success && result.data !== undefined) {
            (settings as any)[key] = result.data;
          }
        } catch (error) {
          console.warn(`Failed to load setting ${key}:`, error);
        }
      }
      
      return settings;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load settings');
    }
  }
);

export const saveSetting = createAsyncThunk(
  'settings/saveSetting',
  async ({ key, value }: { key: keyof SettingsState; value: any }, { rejectWithValue }) => {
    try {
      const result = await window.freezeGuardAPI.config.set(key, value);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { key, value };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save setting');
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (_, { rejectWithValue }) => {
    try {
      // Reset to default values by saving each default setting
      const defaultSettings = initialState;
      
      for (const [key, value] of Object.entries(defaultSettings)) {
        if (key !== 'isLoading' && key !== 'error') {
          const result = await window.freezeGuardAPI.config.set(key, value);
          if (!result.success) {
            throw new Error(`Failed to reset ${key}: ${result.error}`);
          }
        }
      }
      
      return defaultSettings;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reset settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSetting: (state, action: PayloadAction<{ key: keyof SettingsState; value: any }>) => {
      const { key, value } = action.payload;
      if (key !== 'isLoading' && key !== 'error') {
        (state as any)[key] = value;
      }
    },
    
    addExcludePattern: (state, action: PayloadAction<string>) => {
      const pattern = action.payload.trim();
      if (pattern && !state.excludePatterns.includes(pattern)) {
        state.excludePatterns.push(pattern);
      }
    },
    
    removeExcludePattern: (state, action: PayloadAction<string>) => {
      const pattern = action.payload;
      state.excludePatterns = state.excludePatterns.filter(p => p !== pattern);
    },
    
    updateExcludePattern: (state, action: PayloadAction<{ index: number; pattern: string }>) => {
      const { index, pattern } = action.payload;
      if (index >= 0 && index < state.excludePatterns.length) {
        state.excludePatterns[index] = pattern.trim();
      }
    },
    
    setPerformanceMode: (state, action: PayloadAction<'balanced' | 'performance' | 'efficiency'>) => {
      state.performanceMode = action.payload;
      
      // Adjust related settings based on performance mode
      switch (action.payload) {
        case 'performance':
          state.maxConcurrentOperations = 5;
          state.compressionEnabled = false;
          break;
        case 'efficiency':
          state.maxConcurrentOperations = 1;
          state.compressionEnabled = true;
          break;
        case 'balanced':
        default:
          state.maxConcurrentOperations = 3;
          state.compressionEnabled = true;
          break;
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load settings
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save setting
      .addCase(saveSetting.fulfilled, (state, action) => {
        const { key, value } = action.payload;
        if (key !== 'isLoading' && key !== 'error') {
          (state as any)[key] = value;
        }
      })
      .addCase(saveSetting.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Reset settings
      .addCase(resetSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        Object.assign(state, action.payload);
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateSetting,
  addExcludePattern,
  removeExcludePattern,
  updateExcludePattern,
  setPerformanceMode,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;