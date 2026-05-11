import '@testing-library/jest-dom';

// jsdom's built-in localStorage is incomplete — replace with a full implementation
const buildLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = String(value);
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
    get length(): number {
      return Object.keys(store).length;
    },
  };
};

Object.defineProperty(window, 'localStorage', {
  value: buildLocalStorageMock(),
  writable: true,
});
