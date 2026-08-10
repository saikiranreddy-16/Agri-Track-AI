import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 90,
      },
      exclude: [
        'node_modules/',
        'tests/',
        'config/db.js',
        'server.js',
      ],
    },
  },
});
