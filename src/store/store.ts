import { configureStore } from '@reduxjs/toolkit';
import { selectionSlice } from './selectionSlice';
import { rickmortyApi } from './api/rickmortyApi';

export const store = configureStore({
  reducer: {
    selection: selectionSlice.reducer,
    [rickmortyApi.reducerPath]: rickmortyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rickmortyApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
