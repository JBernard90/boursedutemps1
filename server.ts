import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import app from './api/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  const PORT = 3000;

  // Vite or Static
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Vite initialization failed:', e);
      app.use(express.static('dist'));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        res.sendFile(resolve(__dirname, 'dist/index.html'));
      });
    }
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(resolve(__dirname, 'dist/index.html'));
    });
  }

  // Final fallback for API routes that weren't caught
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found', success: false });
  });

  // Global error handler for the main app
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]', err);
    if (req.path.startsWith('/api/')) {
      return res.status(err.status || 500).json({ error: err.message || 'Internal Server Error', success: false });
    }
    next(err);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on port ${PORT}`);
  });
}

startServer().catch(console.error);
