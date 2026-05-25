import { configureStore } from '@reduxjs/toolkit';
import { selectionSlice } from './selectionSlice';

export const store = configureStore({
  reducer: {
    selection: selectionSlice.reducer,
  },
});

// Выводим типы из store — единственный источник истины для типов
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
