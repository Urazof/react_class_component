import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { selectionSlice } from './store/selectionSlice';

function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const store = configureStore({
    reducer: { selection: selectionSlice.reducer },
  });

  return render(<Provider store={store}>{ui}</Provider>, options);
}

export { renderWithProviders };
