import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { NextIntlClientProvider } from 'next-intl';
import { selectionSlice } from './store/selectionSlice';
import { rickmortyApi } from './store/api/rickmortyApi';
import { ThemeProvider } from './context/ThemeContext';
import type { RootState } from './store/store';
import enMessages from '../messages/en.json';

type RenderWithProvidersOptions = {
  preloadedState?: Partial<RootState>;
} & Omit<RenderOptions, 'wrapper'>;

// TypeScript 6 + RTK 2.x: explicit wrapper functions to satisfy the
// 3-param Reducer<S, A, PreloadedState> signature required by configureStore.
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

function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, ...renderOptions }: RenderWithProvidersOptions = {}
) {
  const store = configureStore({
    reducer: {
      selection: selectionReducer,
      [rickmortyApi.reducerPath]: apiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(rickmortyApi.middleware),
    preloadedState,
  });

  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <Provider store={store}>
        <ThemeProvider>{ui}</ThemeProvider>
      </Provider>
    </NextIntlClientProvider>,
    renderOptions
  );
}

export { renderWithProviders };
