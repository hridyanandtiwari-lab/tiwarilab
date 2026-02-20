import express from 'express';
import { getPool } from '../db/pool.js';

const router = express.Router();

// GET /api/flats - list flats (optionally filter by floorId)
router.get('/flats', async (req, res) => {
  const { floorId } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT
        fl.FlatID,
        fl.FloorID,
        fl.FlatNumber,
        fl.FlatType,
        fl.Status,
        f.FloorNumber,
        f.BuildingID,
        b.BuildingName
      FROM Flats fl
      JOIN Floors f ON fl.FloorID = f.FloorID
      JOIN Buildings b ON f.BuildingID = b.BuildingID
    `;

    if (floorId) {
      query += ' WHERE fl.FloorID = @FloorID';
      request.input('FloorID', floorId);
    }

    query += ' ORDER BY b.BuildingName, f.FloorNumber, fl.FlatNumber';

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching flats:', err.message);
    res.status(500).json({ message: 'Failed to fetch flats' });
  }
});

// POST /api/flats - create flat
router.post('/flats', async (req, res) => {
  const { floorId, flatNumber, flatType, status } = req.body;

  if (!floorId || !flatNumber) {
    return res.status(400).json({ message: 'floorId and flatNumber are required' });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('FloorID', floorId);
    request.input('FlatNumber', flatNumber);
    request.input('FlatType', flatType || null);
    request.input('Status', status || 'Active');

    const result = await request.query(`
      INSERT INTO Flats (FloorID, FlatNumber, FlatType, Status)
      OUTPUT INSERTED.FlatID, INSERTED.FloorID, INSERTED.FlatNumber, INSERTED.FlatType, INSERTED.Status
      VALUES (@FloorID, @FlatNumber, @FlatType, @Status);
    `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error creating flat:', err.message);
    res.status(500).json({ message: 'Failed to create flat' });
  }
});

// PUT /api/flats/:id - update flat
router.put('/flats/:id', async (req, res) => {
  const { id } = req.params;
  const { floorId, flatNumber, flatType, status } = req.body;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('FlatID', id);
    request.input('FloorID', floorId || null);
    request.input('FlatNumber', flatNumber || null);
    request.input('FlatType', flatType || null);
    request.input('Status', status || null);

    const result = await request.query(`
      UPDATE Flats
      SET FloorID = COALESCE(@FloorID, FloorID),
          FlatNumber = COALESCE(@FlatNumber, FlatNumber),
          FlatType = COALESCE(@FlatType, FlatType),
          Status = COALESCE(@Status, Status)
      OUTPUT INSERTED.FlatID, INSERTED.FloorID, INSERTED.FlatNumber, INSERTED.FlatType, INSERTED.Status
      WHERE FlatID = @FlatID;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating flat:', err.message);
    res.status(500).json({ message: 'Failed to update flat' });
  }
});

// DELETE /api/flats/:id - delete flat
router.delete('/flats/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('FlatID', id);

    const result = await request.query(`
      DELETE FROM Flats WHERE FlatID = @FlatID;
      SELECT @@ROWCOUNT AS RowsAffected;
    `);

    if (!result.recordset[0].RowsAffected) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting flat:', err.message);
    res.status(500).json({ message: 'Failed to delete flat' });
  }
});

export default router;
