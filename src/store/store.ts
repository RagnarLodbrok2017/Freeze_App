import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import targetsSlice from './slices/targetsSlice';
import operationsSlice from './slices/operationsSlice';
import notificationsSlice from './slices/notificationsSlice';
import settingsSlice from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    app: appSlice,
    targets: targetsSlice,
    operations: operationsSlice,
    notifications: notificationsSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;