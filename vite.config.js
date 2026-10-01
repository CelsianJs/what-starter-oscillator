import { defineConfig } from 'vite';
import what from 'what-compiler/vite';

export default defineConfig({
  plugins: [what()],
  build: {
    sourcemap: true,
  },
  server: {
    host: '127.0.0.1',
  },
});
