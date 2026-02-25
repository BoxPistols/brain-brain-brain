import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    test: {
      exclude: ['e2e/**', 'node_modules/**'],
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openai/, '/v1/chat/completions'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.OPENAI_API_KEY)
                proxyReq.setHeader('Authorization', `Bearer ${env.OPENAI_API_KEY}`);
            });
          },
        },
      },
    },
  };
});
