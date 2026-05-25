import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Типизированные обёртки над useDispatch и useSelector.
// Использовать везде вместо голых useDispatch/useSelector — TypeScript знает типы.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
