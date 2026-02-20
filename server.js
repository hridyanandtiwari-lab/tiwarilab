import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { getPool } from './db/pool.js';
import buildingsRouter from './routes/buildings.routes.js';
import employeesRouter from './routes/employees.routes.js';
import floorsRouter from './routes/floors.routes.js';
import flatsRouter from './routes/flats.routes.js';
import roomsRouter from './routes/rooms.routes.js';
import bedsRouter from './routes/beds.routes.js';
import assignmentsRouter from './routes/assignments.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
// Simple inline health check so the frontend can reliably call /api/health
app.get('/api/health', async (req, res) => {
  try {
    if (process.env.DB_SERVER && process.env.DB_NAME) {
      const pool = await getPool();
      await pool.request().query('SELECT 1 AS ok');
      return res.json({ status: 'ok', db: 'connected' });
    }

    return res.json({ status: 'ok', db: 'not-configured' });
  } catch (err) {
    console.error('Health check failed:', err.message);
    return res.status(500).json({ status: 'error', message: 'DB connection failed' });
  }
});

app.use('/api', buildingsRouter);
app.use('/api', employeesRouter);
app.use('/api', floorsRouter);
app.use('/api', flatsRouter);
app.use('/api', roomsRouter);
app.use('/api', bedsRouter);
app.use('/api', assignmentsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend API server listening on port ${PORT}`);
});
