import express from 'express';
import { getPool } from '../db/pool.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Try a lightweight DB ping if config is present
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

export default router;
