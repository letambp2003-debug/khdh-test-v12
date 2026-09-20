import express from 'express';
import cors from 'cors';
import path from 'path';
import { CONFIG } from './config';
import { apiRouter } from './routes/apiRoutes';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api', apiRouter);

// Static frontend files
const publicDir = process.cwd();
app.use(express.static(publicDir));

// Fallback to index.html for client routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.resolve(publicDir, 'index.html'));
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ ok: false, error: 'Malformed JSON payload' });
  }
  return res.status(500).json({ ok: false, error: err.message || 'Internal Server Error' });
});

if (require.main === module) {
  app.listen(CONFIG.PORT, () => {
    console.log(`[SERVER] 🚀 ${CONFIG.APP_NAME} đang chạy tại: http://localhost:${CONFIG.PORT}`);
    console.log(`[SERVER] 🔍 Health-check endpoints: http://localhost:${CONFIG.PORT}/api/health/connections`);
  });
}
