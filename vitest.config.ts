import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Redirect Next.js navigation module to a jsdom-compatible mock.
      // next/navigation uses browser APIs not available in the test environment.
      'next/navigation': path.resolve(__dirname, 'src/__mocks__/next-navigation.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    server: {
      deps: {
        // Force Vitest to transform next-intl and next packages so that
        // the resolve.alias for 'next/navigation' applies inside node_modules.
        inline: ['next-intl', 'next'],
      },
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/main.tsx',
        'src/setupTests.ts',
        'src/**/*.d.ts',
        'src/__mocks__/**',
      ],
      thresholds: {
        statements: 80,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
});
