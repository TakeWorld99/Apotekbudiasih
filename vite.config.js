import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { createApiMiddleware } from './server/api.js';

// Plugin Backend API PostgreSQL Modular (Auto-reloaded)
function postgresBackendPlugin() {
  return {
    name: 'postgres-backend-plugin',
    configureServer(server) {
      server.middlewares.use(createApiMiddleware());
    }
  };
}

export default defineConfig({
  plugins: [vue(), postgresBackendPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
