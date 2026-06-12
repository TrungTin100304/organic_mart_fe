import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  const proxyTarget = env.VITE_API_PROXY_TARGET
    || 'https://organic-mart-be.onrender.com';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/v1': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (pathStr) => pathStr,
        },
      },
    },
    preview: {
      proxy: {
        '/api/v1': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (pathStr) => pathStr,
        },
      },
    },
  };
});
