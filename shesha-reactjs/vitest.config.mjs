import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react()],
  test: {
    environment: 'jsdom', // Use jsdom for DOM testing
    globals: true, // Optional: makes test APIs (describe, it, expect) globally available
    setupFiles: ['./vitest-setup.ts'], // Optional: path to a setup file
  },
});