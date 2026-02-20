import express from 'express';
import { getPool } from '../db/pool.js';

const router = express.Router();

// GET /api/floors - list floors (optionally filter by buildingId)
router.get('/floors', async (req, res) => {
  const { buildingId } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = `
      SELECT f.FloorID, f.BuildingID, f.FloorNumber, f.Description,
             b.BuildingName
      FROM Floors f
      JOIN Buildings b ON f.BuildingID = b.BuildingID
    `;

    if (buildingId) {
      query += ' WHERE f.BuildingID = @BuildingID';
      request.input('BuildingID', buildingId);
    }

    query += ' ORDER BY b.BuildingName, f.FloorNumber';

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching floors:', err.message);
    res.status(500).json({ message: 'Failed to fetch floors' });
  }
});

// POST /api/floors - create floor
router.post('/floors', async (req, res) => {
  const { buildingId, floorNumber, description } = req.body;

  if (!buildingId || floorNumber === undefined || floorNumber === null) {
    return res.status(400).json({ message: 'buildingId and floorNumber are required' });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('BuildingID', buildingId);
    request.input('FloorNumber', floorNumber);
    request.input('Description', description || null);

    const result = await request.query(`
      INSERT INTO Floors (BuildingID, FloorNumber, Description)
      VALUES (@BuildingID, @FloorNumber, @Description);

      SELECT TOP 1 f.FloorID, f.BuildingID, f.FloorNumber, f.Description, b.BuildingName
      FROM Floors f
      JOIN Buildings b ON f.BuildingID = b.BuildingID
      WHERE f.FloorID = SCOPE_IDENTITY();
    `);

    const recordsets = result.recordsets;
    const finalSet = recordsets && recordsets.length > 0 ? recordsets[recordsets.length - 1] : result.recordset;

    res.status(201).json(finalSet[0]);
  } catch (err) {
    console.error('Error creating floor:', err.message);
    res.status(500).json({ message: 'Failed to create floor' });
  }
});

// PUT /api/floors/:id - update floor
router.put('/floors/:id', async (req, res) => {
  const { id } = req.params;
  const { buildingId, floorNumber, description } = req.body;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('FloorID', id);
    request.input('BuildingID', buildingId || null);
    request.input('FloorNumber', floorNumber || null);
    request.input('Description', description || null);

    const result = await request.query(`
      UPDATE Floors
      SET BuildingID = COALESCE(@BuildingID, BuildingID),
          FloorNumber = COALESCE(@FloorNumber, FloorNumber),
          Description = COALESCE(@Description, Description)
      WHERE FloorID = @FloorID;

      SELECT TOP 1 f.FloorID, f.BuildingID, f.FloorNumber, f.Description, b.BuildingName
      FROM Floors f
      JOIN Buildings b ON f.BuildingID = b.BuildingID
      WHERE f.FloorID = @FloorID;
    `);

    const recordsets = result.recordsets;
    const finalSet = recordsets && recordsets.length > 0 ? recordsets[recordsets.length - 1] : result.recordset;

    if (!finalSet || finalSet.length === 0) {
      return res.status(404).json({ message: 'Floor not found' });
    }

    res.json(finalSet[0]);
  } catch (err) {
    console.error('Error updating floor:', err.message);
    res.status(500).json({ message: 'Failed to update floor' });
  }
});

// DELETE /api/floors/:id - delete floor
router.delete('/floors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('FloorID', id);

    const result = await request.query(`
      DELETE FROM Floors WHERE FloorID = @FloorID;
      SELECT @@ROWCOUNT AS RowsAffected;
    `);

    if (!result.recordset[0].RowsAffected) {
      return res.status(404).json({ message: 'Floor not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting floor:', err.message);
    res.status(500).json({ message: 'Failed to delete floor' });
  }
});

export default router;
