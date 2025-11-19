/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '/react/',
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.ts',
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.d.ts',
        'src/**/types/**',
        'src/**/utils/**',
        'src/**/mocks/**',
        'src/setupTests.ts',
        'src/test-utils/**',
        'src/api/customErrors.ts',
        'src/api/endpoints.ts',
        'src/main.tsx',
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
