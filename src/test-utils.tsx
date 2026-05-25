import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { selectionSlice } from './store/selectionSlice';
import { ThemeProvider } from './context/ThemeContext';
import type { RootState } from './store/store';

type RenderWithProvidersOptions = {
  preloadedState?: Partial<RootState>;
} & Omit<RenderOptions, 'wrapper'>;

function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, ...renderOptions }: RenderWithProvidersOptions = {}
) {
  const store = configureStore({
    reducer: { selection: selectionSlice.reducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <ThemeProvider>{ui}</ThemeProvider>
    </Provider>,
    renderOptions
  );
}

export { renderWithProviders };
