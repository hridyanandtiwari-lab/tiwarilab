import express from 'express';
import { getPool } from '../db/pool.js';

const router = express.Router();

// GET /api/beds - list beds (optionally filter by roomId)
router.get('/beds', async (req, res) => {
  const { roomId } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT
        bd.BedID,
        bd.RoomID,
        bd.BedCode,
        bd.Status,
        r.RoomNumber,
        fl.FlatNumber,
        f.FloorNumber,
        f.BuildingID,
        b.BuildingName
      FROM Beds bd
      LEFT JOIN Rooms r ON bd.RoomID = r.RoomID
      LEFT JOIN Flats fl ON r.FlatID = fl.FlatID
      LEFT JOIN Floors f ON fl.FloorID = f.FloorID
      LEFT JOIN Buildings b ON f.BuildingID = b.BuildingID
    `;

    if (roomId) {
      query += ' WHERE bd.RoomID = @RoomID';
      request.input('RoomID', roomId);
    }

    query += ' ORDER BY b.BuildingName, f.FloorNumber, fl.FlatNumber, r.RoomNumber, bd.BedCode';

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching beds:', err.message);
    res.status(500).json({ message: 'Failed to fetch beds' });
  }
});

// POST /api/beds - create bed
router.post('/beds', async (req, res) => {
  const { roomId, bedCode, status } = req.body;

  if (!roomId || !bedCode) {
    return res.status(400).json({ message: 'roomId and bedCode are required' });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('RoomID', roomId);
    request.input('BedCode', bedCode);
    request.input('Status', status || 'Available');

    const result = await request.query(`
      INSERT INTO Beds (RoomID, BedCode, Status)
      OUTPUT INSERTED.BedID, INSERTED.RoomID, INSERTED.BedCode, INSERTED.Status
      VALUES (@RoomID, @BedCode, @Status);
    `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error creating bed:', err.message);
    if (err.number === 2627) {
      return res.status(409).json({ message: 'BedCode already exists in this room' });
    }
    res.status(500).json({ message: 'Failed to create bed' });
  }
});

// PUT /api/beds/:id - update bed
router.put('/beds/:id', async (req, res) => {
  const { id } = req.params;
  const { roomId, bedCode, status } = req.body;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('BedID', id);
    request.input('RoomID', roomId || null);
    request.input('BedCode', bedCode || null);
    request.input('Status', status || null);

    const result = await request.query(`
      UPDATE Beds
      SET RoomID = COALESCE(@RoomID, RoomID),
          BedCode = COALESCE(@BedCode, BedCode),
          Status = COALESCE(@Status, Status)
      OUTPUT INSERTED.BedID, INSERTED.RoomID, INSERTED.BedCode, INSERTED.Status
      WHERE BedID = @BedID;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating bed:', err.message);
    res.status(500).json({ message: 'Failed to update bed' });
  }
});

// DELETE /api/beds/:id - delete bed
router.delete('/beds/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('BedID', id);

    const result = await request.query(`
      DELETE FROM Beds WHERE BedID = @BedID;
      SELECT @@ROWCOUNT AS RowsAffected;
    `);

    if (!result.recordset[0].RowsAffected) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting bed:', err.message);
    res.status(500).json({ message: 'Failed to delete bed' });
  }
});

export default router;
