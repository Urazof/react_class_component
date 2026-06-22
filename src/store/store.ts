import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { selectionSlice } from './selectionSlice';
import { rickmortyApi } from './api/rickmortyApi';

// TypeScript 6 + RTK 2.x: configureStore expects Reducer<S, A, S | undefined> (3 params),
// but createSlice/.reducer and createApi/.reducer produce Reducer<S> (1-param default).
// Explicit wrapper functions bridge the gap without any type assertions.
type SelectionState = ReturnType<typeof selectionSlice.reducer>;
function selectionReducer(
  state: SelectionState | undefined,
  action: UnknownAction
): SelectionState {
  return selectionSlice.reducer(state, action);
}

type ApiState = ReturnType<typeof rickmortyApi.reducer>;
function apiReducer(state: ApiState | undefined, action: UnknownAction): ApiState {
  return rickmortyApi.reducer(state, action);
}

export const store = configureStore({
  reducer: {
    selection: selectionReducer,
    [rickmortyApi.reducerPath]: apiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rickmortyApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
