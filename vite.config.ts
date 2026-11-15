import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'secure-deepseek-proxy',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { messages } = JSON.parse(body || '{}');
                // La clave se lee del archivo .env.local del host local sin enviarse en el bundle
                const apiKey = env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY;

                if (!apiKey || apiKey.trim().length < 5) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'API Key de DeepSeek no configurada en el servidor' }));
                  return;
                }

                const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey.trim()}`
                  },
                  body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages,
                    temperature: 0.7,
                    max_tokens: 600
                  })
                });

                const data = await dsResponse.json();
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = dsResponse.status;
                res.end(JSON.stringify(data));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Error en servidor proxy' }));
              }
            });
          });
        }
      }
    ],
    server: {
      port: 5173,
      host: true,
    },
  };
});
