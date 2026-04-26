import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import cron from 'node-cron';

import { initDb, pool } from './backend/db.js';
import { authRouter } from './backend/routes/auth.js';
import { apiRouter } from './backend/routes/api.js';
import { processMonthlyDues } from './backend/cron/dues.js';
import { authMiddleware } from './backend/middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await initDb();
  await processMonthlyDues(pool);

  // Run at midnight on the 1st of every month
  cron.schedule('0 0 1 * *', () => {
    processMonthlyDues(pool);
  });

  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Public Routes
  app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
  app.use('/api/auth', authRouter);
  
  // Protected Routes
  app.use('/api', authMiddleware, apiRouter);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al-Ikhwan Server running on http://localhost:${PORT}`);
  });
}

startServer();
