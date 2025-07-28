import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { startOperation, updateOperationProgress, completeOperation, failOperation } from './operationsSlice';

export interface FreezeTarget {
  id: string;
  path: string;
  name: string;
  type: 'folder' | 'partition';
  status: 'active' | 'freezing' | 'frozen' | 'restoring' | 'error';
  createdAt: string;
  lastFrozenAt: string | null;
  lastRestoredAt: string | null;
  size: number;
  changeCount: number;
  snapshotPath: string | null;
}

export interface TargetsState {
  targets: FreezeTarget[];
  selectedTargets: string[];
  isLoading: boolean;
  error: string | null;
  statistics: {
    totalTargets: number;
    frozenTargets: number;
    activeTargets: number;
    totalSize: number;
    totalChanges: number;
  };
}

const initialState: TargetsState = {
  targets: [],
  selectedTargets: [],
  isLoading: false,
  error: null,
  statistics: {
    totalTargets: 0,
    frozenTargets: 0,
    activeTargets: 0,
    totalSize: 0,
    totalChanges: 0,
  },
};

// Async thunks
export const loadTargets = createAsyncThunk(
  'targets/loadTargets',
  async (_, { rejectWithValue }) => {
    try {
      if (!window.freezeGuardAPI) {
        // Return empty array if API is not available (browser mode)
        return [];
      }
      
      const result = await window.freezeGuardAPI.freezeTarget.getAll();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load targets');
      }
      return result.data || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load targets');
    }
  }
);

export const addTarget = createAsyncThunk(
  'targets/addTarget',
  async (targetPath: string, { rejectWithValue }) => {
    try {
      if (!window.freezeGuardAPI) {
        throw new Error('API not available');
      }
      
      const result = await window.freezeGuardAPI.freezeTarget.add(targetPath);
      if (!result.success) {
        throw new Error(result.error || 'Failed to add target');
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add target');
    }
  }
);

export const removeTarget = createAsyncThunk(
  'targets/removeTarget',
  async (targetId: string, { rejectWithValue }) => {
    try {
      if (!window.freezeGuardAPI) {
        throw new Error('API not available');
      }
      
      const result = await window.freezeGuardAPI.freezeTarget.remove(targetId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove target');
      }
      return targetId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove target');
    }
  }
);

export const freezeTarget = createAsyncThunk(
  'targets/freezeTarget',
  async (targetId: string, { rejectWithValue, getState, dispatch }) => {
    try {
      if (!window.freezeGuardAPI) {
        throw new Error('API not available');
      }
      
      const state = getState() as any;
      const target = state.targets.targets.find((t: any) => t.id === targetId);
      if (!target) {
        throw new Error('Target not found');
      }

      // Create operation record
      const operation = await dispatch(startOperation({
        targetId,
        targetName: target.name,
        type: 'freeze',
        status: 'running',
        totalFiles: Math.floor(target.size / 1024) || 100, // Estimate files based on size
        totalBytes: target.size,
      })).unwrap();

      // Simulate progress updates (in real implementation, this would come from the backend)
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (currentProgress < 95) {
          currentProgress += Math.random() * 15;
          currentProgress = Math.min(currentProgress, 95);
          
          dispatch(updateOperationProgress({
            operationId: operation.id,
            progress: currentProgress,
            currentFile: `Processing file ${Math.floor(currentProgress)}.txt`,
            filesProcessed: Math.floor((currentProgress / 100) * operation.totalFiles),
            bytesProcessed: Math.floor((currentProgress / 100) * target.size),
            speed: 1024 * 1024 * (Math.random() * 5 + 1), // Random speed 1-6 MB/s
            estimatedTimeRemaining: Math.floor((100 - currentProgress) * 2), // Rough estimate
          }));
        }
      }, 800);

      try {
        const result = await window.freezeGuardAPI.freezeTarget.freeze(targetId);
        
        clearInterval(progressInterval);
        
        if (!result.success) {
          const errorMessage = result.error || 'Unknown error occurred';
          await dispatch(failOperation({ operationId: operation.id, error: errorMessage }));
          throw new Error(errorMessage);
        }

        // Complete the operation
        await dispatch(updateOperationProgress({
          operationId: operation.id,
          progress: 100,
          currentFile: 'Finalizing...',
          filesProcessed: operation.totalFiles,
          bytesProcessed: target.size,
          speed: 0,
          estimatedTimeRemaining: 0,
        }));

        await dispatch(completeOperation(operation.id));
        return targetId;
      } catch (error) {
        clearInterval(progressInterval);
        await dispatch(failOperation({ 
          operationId: operation.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
        throw error;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to freeze target');
    }
  }
);

export const restoreTarget = createAsyncThunk(
  'targets/restoreTarget',
  async (targetId: string, { rejectWithValue, getState, dispatch }) => {
    try {
      if (!window.freezeGuardAPI) {
        throw new Error('API not available');
      }
      
      const state = getState() as any;
      const target = state.targets.targets.find((t: any) => t.id === targetId);
      if (!target) {
        throw new Error('Target not found');
      }

      // Create operation record
      const operation = await dispatch(startOperation({
        targetId,
        targetName: target.name,
        type: 'restore',
        status: 'running',
        totalFiles: Math.floor(target.size / 1024) || 100, // Estimate files based on size
        totalBytes: target.size,
      })).unwrap();

      // Simulate progress updates
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (currentProgress < 95) {
          currentProgress += Math.random() * 12;
          currentProgress = Math.min(currentProgress, 95);
          
          dispatch(updateOperationProgress({
            operationId: operation.id,
            progress: currentProgress,
            currentFile: `Restoring file ${Math.floor(currentProgress)}.txt`,
            filesProcessed: Math.floor((currentProgress / 100) * operation.totalFiles),
            bytesProcessed: Math.floor((currentProgress / 100) * target.size),
            speed: 1024 * 1024 * (Math.random() * 8 + 2), // Random speed 2-10 MB/s (restore is usually faster)
            estimatedTimeRemaining: Math.floor((100 - currentProgress) * 1.5), // Restore estimate
          }));
        }
      }, 600);

      try {
        const result = await window.freezeGuardAPI.freezeTarget.restore(targetId);
        
        clearInterval(progressInterval);
        
        if (!result.success) {
          const errorMessage = result.error || 'Unknown error occurred';
          await dispatch(failOperation({ operationId: operation.id, error: errorMessage }));
          throw new Error(errorMessage);
        }

        // Complete the operation
        await dispatch(updateOperationProgress({
          operationId: operation.id,
          progress: 100,
          currentFile: 'Finalizing restore...',
          filesProcessed: operation.totalFiles,
          bytesProcessed: target.size,
          speed: 0,
          estimatedTimeRemaining: 0,
        }));

        await dispatch(completeOperation(operation.id));
        return targetId;
      } catch (error) {
        clearInterval(progressInterval);
        await dispatch(failOperation({ 
          operationId: operation.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
        throw error;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to restore target');
    }
  }
);

export const selectFolder = createAsyncThunk(
  'targets/selectFolder',
  async (_, { rejectWithValue }) => {
    try {
      if (!window.freezeGuardAPI) {
        throw new Error('API not available - running in browser mode');
      }
      
      const result = await window.freezeGuardAPI.fileSystem.selectFolder();
      if (!result.success) {
        throw new Error(result.error || 'Failed to select folder');
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to select folder');
    }
  }
);

const targetsSlice = createSlice({
  name: 'targets',
  initialState,
  reducers: {
    selectTarget: (state, action: PayloadAction<string>) => {
      const targetId = action.payload;
      if (!state.selectedTargets.includes(targetId)) {
        state.selectedTargets.push(targetId);
      }
    },
    deselectTarget: (state, action: PayloadAction<string>) => {
      const targetId = action.payload;
      state.selectedTargets = state.selectedTargets.filter(id => id !== targetId);
    },
    toggleTargetSelection: (state, action: PayloadAction<string>) => {
      const targetId = action.payload;
      if (state.selectedTargets.includes(targetId)) {
        state.selectedTargets = state.selectedTargets.filter(id => id !== targetId);
      } else {
        state.selectedTargets.push(targetId);
      }
    },
    selectAllTargets: (state) => {
      state.selectedTargets = state.targets.map(target => target.id);
    },
    deselectAllTargets: (state) => {
      state.selectedTargets = [];
    },
    updateTargetStatus: (state, action: PayloadAction<{ targetId: string; status: FreezeTarget['status'] }>) => {
      const { targetId, status } = action.payload;
      const target = state.targets.find(t => t.id === targetId);
      if (target) {
        target.status = status;
      }
    },
    updateTargetChanges: (state, action: PayloadAction<{ targetId: string; changeCount: number }>) => {
      const { targetId, changeCount } = action.payload;
      const target = state.targets.find(t => t.id === targetId);
      if (target) {
        target.changeCount = changeCount;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load targets
      .addCase(loadTargets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTargets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.targets = action.payload;
        state.statistics = calculateStatistics(action.payload);
      })
      .addCase(loadTargets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add target
      .addCase(addTarget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTarget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.targets.push(action.payload);
        state.statistics = calculateStatistics(state.targets);
      })
      .addCase(addTarget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove target
      .addCase(removeTarget.fulfilled, (state, action) => {
        const targetId = action.payload;
        state.targets = state.targets.filter(target => target.id !== targetId);
        state.selectedTargets = state.selectedTargets.filter(id => id !== targetId);
        state.statistics = calculateStatistics(state.targets);
      })
      .addCase(removeTarget.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Freeze target
      .addCase(freezeTarget.pending, (state, action) => {
        const targetId = action.meta.arg;
        const target = state.targets.find(t => t.id === targetId);
        if (target) {
          target.status = 'freezing';
        }
      })
      .addCase(freezeTarget.fulfilled, (state, action) => {
        const targetId = action.payload;
        const target = state.targets.find(t => t.id === targetId);
        if (target) {
          target.status = 'frozen';
          target.lastFrozenAt = new Date().toISOString();
          target.changeCount = 0;
        }
        state.statistics = calculateStatistics(state.targets);
      })
      .addCase(freezeTarget.rejected, (state, action) => {
        const targetId = action.meta.arg;
        const target = state.targets.find(t => t.id === targetId);
        if (target) {
          target.status = 'error';
        }
        state.error = action.payload as string;
      })
      // Restore target
      .addCase(restoreTarget.pending, (state, action) => {
        const targetId = action.meta.arg;
        const target = state.targets.find(t => t.id === targetId);
        if (target) {
          target.status = 'restoring';
        }
      })
      .addCase(restoreTarget.fulfilled, (state, action) => {
        const targetId = action.payload;
        const target = state.targets.find(t => t.id === targetId);
        if (target) {
          target.status = 'active';
          target.lastRestoredAt = new Date().toISOString();
          target.changeCount = 0;
        }
        state.statistics = calculateStatistics(state.targets);
      })
      .addCase(restoreTarget.rejected, (state, action) => {
        const targetId = action.meta.arg;
        const target = state.targets.find(t => t.id === targetId);
        if (target) {
          target.status = 'error';
        }
        state.error = action.payload as string;
      });
  },
});

// Helper function to calculate statistics
function calculateStatistics(targets: FreezeTarget[]) {
  return {
    totalTargets: targets.length,
    frozenTargets: targets.filter(t => t.status === 'frozen').length,
    activeTargets: targets.filter(t => t.status === 'active').length,
    totalSize: targets.reduce((sum, t) => sum + t.size, 0),
    totalChanges: targets.reduce((sum, t) => sum + t.changeCount, 0),
  };
}

export const {
  selectTarget,
  deselectTarget,
  toggleTargetSelection,
  selectAllTargets,
  deselectAllTargets,
  updateTargetStatus,
  updateTargetChanges,
  clearError,
} = targetsSlice.actions;

export default targetsSlice.reducer;