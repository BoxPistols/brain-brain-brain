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
              // Pro モード: ユーザーの API キーを優先
              const userKey = proxyReq.getHeader('x-api-key') as string | undefined;
              if (userKey) {
                proxyReq.setHeader('Authorization', `Bearer ${userKey}`);
                proxyReq.removeHeader('x-api-key');
              } else if (env.OPENAI_API_KEY) {
                proxyReq.setHeader('Authorization', `Bearer ${env.OPENAI_API_KEY}`);
              }
            });
          },
        },
      },
    },
  };
});
