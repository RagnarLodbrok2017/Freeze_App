import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Operation {
  id: string;
  targetId: string;
  targetName: string;
  type: 'freeze' | 'restore';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  progress: number;
  error?: string;
  
  // Progress details
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  bytesProcessed: number;
  totalBytes: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

export interface OperationsState {
  operations: Operation[];
  activeOperations: string[];
  completedOperations: string[];
  failedOperations: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OperationsState = {
  operations: [],
  activeOperations: [],
  completedOperations: [],
  failedOperations: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const startOperation = createAsyncThunk(
  'operations/startOperation',
  async (operation: Omit<Operation, 'id' | 'startTime' | 'progress' | 'filesProcessed' | 'bytesProcessed' | 'speed' | 'estimatedTimeRemaining'>, { rejectWithValue }) => {
    try {
      const newOperation: Operation = {
        ...operation,
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: new Date().toISOString(),
        progress: 0,
        filesProcessed: 0,
        bytesProcessed: 0,
        speed: 0,
        estimatedTimeRemaining: 0,
      };
      
      return newOperation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to start operation');
    }
  }
);

export const updateOperationProgress = createAsyncThunk(
  'operations/updateProgress',
  async (update: {
    operationId: string;
    progress: number;
    currentFile?: string;
    filesProcessed: number;
    bytesProcessed: number;
    speed: number;
    estimatedTimeRemaining: number;
  }, { rejectWithValue }) => {
    try {
      return update;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update progress');
    }
  }
);

export const completeOperation = createAsyncThunk(
  'operations/complete',
  async (operationId: string, { rejectWithValue }) => {
    try {
      return {
        operationId,
        endTime: new Date().toISOString(),
        status: 'completed' as const,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to complete operation');
    }
  }
);

export const failOperation = createAsyncThunk(
  'operations/fail',
  async ({ operationId, error }: { operationId: string; error: string }, { rejectWithValue }) => {
    try {
      return {
        operationId,
        endTime: new Date().toISOString(),
        status: 'failed' as const,
        error,
      };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fail operation');
    }
  }
);

export const cancelOperation = createAsyncThunk(
  'operations/cancel',
  async (operationId: string, { rejectWithValue }) => {
    try {
      return {
        operationId,
        endTime: new Date().toISOString(),
        status: 'cancelled' as const,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to cancel operation');
    }
  }
);

const operationsSlice = createSlice({
  name: 'operations',
  initialState,
  reducers: {
    clearCompletedOperations: (state) => {
      state.operations = state.operations.filter(op => !state.completedOperations.includes(op.id));
      state.completedOperations = [];
    },
    clearFailedOperations: (state) => {
      state.operations = state.operations.filter(op => !state.failedOperations.includes(op.id));
      state.failedOperations = [];
    },
    clearAllOperations: (state) => {
      state.operations = state.operations.filter(op => state.activeOperations.includes(op.id));
      state.completedOperations = [];
      state.failedOperations = [];
    },
    removeOperation: (state, action: PayloadAction<string>) => {
      const operationId = action.payload;
      state.operations = state.operations.filter(op => op.id !== operationId);
      state.activeOperations = state.activeOperations.filter(id => id !== operationId);
      state.completedOperations = state.completedOperations.filter(id => id !== operationId);
      state.failedOperations = state.failedOperations.filter(id => id !== operationId);
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start operation
      .addCase(startOperation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startOperation.fulfilled, (state, action) => {
        state.isLoading = false;
        const operation = action.payload;
        state.operations.push(operation);
        state.activeOperations.push(operation.id);
      })
      .addCase(startOperation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update progress
      .addCase(updateOperationProgress.fulfilled, (state, action) => {
        const { operationId, ...updates } = action.payload;
        const operation = state.operations.find(op => op.id === operationId);
        if (operation) {
          Object.assign(operation, updates);
        }
      })
      
      // Complete operation
      .addCase(completeOperation.fulfilled, (state, action) => {
        const { operationId, endTime, status } = action.payload;
        const operation = state.operations.find(op => op.id === operationId);
        if (operation) {
          operation.endTime = endTime;
          operation.status = status;
          operation.progress = 100;
        }
        
        // Move from active to completed
        state.activeOperations = state.activeOperations.filter(id => id !== operationId);
        if (!state.completedOperations.includes(operationId)) {
          state.completedOperations.push(operationId);
        }
      })
      
      // Fail operation
      .addCase(failOperation.fulfilled, (state, action) => {
        const { operationId, endTime, status, error } = action.payload;
        const operation = state.operations.find(op => op.id === operationId);
        if (operation) {
          operation.endTime = endTime;
          operation.status = status;
          operation.error = error;
        }
        
        // Move from active to failed
        state.activeOperations = state.activeOperations.filter(id => id !== operationId);
        if (!state.failedOperations.includes(operationId)) {
          state.failedOperations.push(operationId);
        }
      })
      
      // Cancel operation
      .addCase(cancelOperation.fulfilled, (state, action) => {
        const { operationId, endTime, status } = action.payload;
        const operation = state.operations.find(op => op.id === operationId);
        if (operation) {
          operation.endTime = endTime;
          operation.status = status;
        }
        
        // Remove from active operations
        state.activeOperations = state.activeOperations.filter(id => id !== operationId);
      });
  },
});

export const {
  clearCompletedOperations,
  clearFailedOperations,
  clearAllOperations,
  removeOperation,
  setError,
  clearError,
} = operationsSlice.actions;

export default operationsSlice.reducer;