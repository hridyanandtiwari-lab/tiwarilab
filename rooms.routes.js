import express from 'express';
import { getPool } from '../db/pool.js';

const router = express.Router();

// GET /api/rooms - list rooms (optionally filter by flatId)
router.get('/rooms', async (req, res) => {
  const { flatId } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT
        r.RoomID,
        r.FlatID,
        r.RoomNumber,
        r.RoomType,
        r.MaxOccupancy,
        r.GenderRestriction,
        r.Status,
        fl.FlatNumber,
        f.FloorNumber,
        f.BuildingID,
        b.BuildingName
      FROM Rooms r
      LEFT JOIN Flats fl ON r.FlatID = fl.FlatID
      LEFT JOIN Floors f ON fl.FloorID = f.FloorID
      LEFT JOIN Buildings b ON f.BuildingID = b.BuildingID
    `;

    if (flatId) {
      query += ' WHERE r.FlatID = @FlatID';
      request.input('FlatID', flatId);
    }

    query += ' ORDER BY b.BuildingName, f.FloorNumber, fl.FlatNumber, r.RoomNumber';

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching rooms:', err.message);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});

// POST /api/rooms - create room
router.post('/rooms', async (req, res) => {
  const { flatId, roomNumber, roomType, maxOccupancy, genderRestriction, status } = req.body;

  if (!flatId || !roomNumber || !maxOccupancy) {
    return res.status(400).json({ message: 'flatId, roomNumber and maxOccupancy are required' });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('FlatID', flatId);
    request.input('RoomNumber', roomNumber);
    request.input('RoomType', roomType || null);
    request.input('MaxOccupancy', maxOccupancy);
    request.input('GenderRestriction', genderRestriction || null);
    request.input('Status', status || 'Active');

    const result = await request.query(`
      INSERT INTO Rooms (FlatID, RoomNumber, RoomType, MaxOccupancy, GenderRestriction, Status)
      OUTPUT INSERTED.RoomID, INSERTED.FlatID, INSERTED.RoomNumber, INSERTED.RoomType,
             INSERTED.MaxOccupancy, INSERTED.GenderRestriction, INSERTED.Status
      VALUES (@FlatID, @RoomNumber, @RoomType, @MaxOccupancy, @GenderRestriction, @Status);
    `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error creating room:', err.message);
    res.status(500).json({ message: 'Failed to create room' });
  }
});

// PUT /api/rooms/:id - update room
router.put('/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { flatId, roomNumber, roomType, maxOccupancy, genderRestriction, status } = req.body;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('RoomID', id);
    request.input('FlatID', flatId || null);
    request.input('RoomNumber', roomNumber || null);
    request.input('RoomType', roomType || null);
    request.input('MaxOccupancy', maxOccupancy || null);
    request.input('GenderRestriction', genderRestriction || null);
    request.input('Status', status || null);

    const result = await request.query(`
      UPDATE Rooms
      SET FlatID = COALESCE(@FlatID, FlatID),
          RoomNumber = COALESCE(@RoomNumber, RoomNumber),
          RoomType = COALESCE(@RoomType, RoomType),
          MaxOccupancy = COALESCE(@MaxOccupancy, MaxOccupancy),
          GenderRestriction = COALESCE(@GenderRestriction, GenderRestriction),
          Status = COALESCE(@Status, Status)
      OUTPUT INSERTED.RoomID, INSERTED.FlatID, INSERTED.RoomNumber, INSERTED.RoomType,
             INSERTED.MaxOccupancy, INSERTED.GenderRestriction, INSERTED.Status
      WHERE RoomID = @RoomID;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating room:', err.message);
    res.status(500).json({ message: 'Failed to update room' });
  }
});

// DELETE /api/rooms/:id - delete room
router.delete('/rooms/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('RoomID', id);

    const result = await request.query(`
      DELETE FROM Rooms WHERE RoomID = @RoomID;
      SELECT @@ROWCOUNT AS RowsAffected;
    `);

    if (!result.recordset[0].RowsAffected) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting room:', err.message);
    res.status(500).json({ message: 'Failed to delete room' });
  }
});

export default router;
