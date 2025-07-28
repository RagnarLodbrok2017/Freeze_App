import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  currentView: 'dashboard' | 'targets' | 'operations' | 'settings';
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  error: string | null;
  version: string;
  platform: string;
}

const initialState: AppState = {
  isInitialized: false,
  isLoading: false,
  currentView: 'dashboard',
  sidebarOpen: false,
  theme: 'system',
  error: null,
  version: '1.0.0',
  platform: typeof process !== 'undefined' ? process.platform : 'unknown',
};

// Async thunks
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Load initial configuration
      let theme: 'light' | 'dark' | 'system' = 'system';
      
      // Only try to access Electron API if it exists
      if (window.freezeGuardAPI) {
        try {
          const themeResult = await window.freezeGuardAPI.config.get('theme');
          if (themeResult.success && themeResult.data) {
            const themeValue = themeResult.data;
            // Validate theme value
            if (themeValue === 'light' || themeValue === 'dark' || themeValue === 'system') {
              theme = themeValue;
            }
          }
        } catch (error) {
          console.warn('Failed to load theme from config:', error);
        }
      }
      
      return { theme };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize app');
    }
  }
);

export const updateTheme = createAsyncThunk(
  'app/updateTheme',
  async (theme: 'light' | 'dark' | 'system', { rejectWithValue }) => {
    try {
      if (window.freezeGuardAPI) {
        const result = await window.freezeGuardAPI.config.set('theme', theme);
        if (!result.success) {
          throw new Error(result.error);
        }
      }
      return theme;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update theme');
    }
  }
);

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<AppState['currentView']>) => {
      state.currentView = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize app
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.theme = action.payload.theme;
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update theme
      .addCase(updateTheme.fulfilled, (state, action) => {
        state.theme = action.payload;
      })
      .addCase(updateTheme.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentView,
  toggleSidebar,
  setSidebarOpen,
  setError,
  clearError,
  setLoading,
} = appSlice.actions;

export default appSlice.reducer;