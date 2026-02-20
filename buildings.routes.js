import express from 'express';
import { getPool } from '../db/pool.js';

const router = express.Router();

// GET /api/buildings - list buildings
router.get('/buildings', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP 50 BuildingID, BuildingName, Location, Description, Status
      FROM Buildings
      ORDER BY BuildingName
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching buildings:', err.message);
    res.status(500).json({ message: 'Failed to fetch buildings' });
  }
});

// POST /api/buildings - create building
router.post('/buildings', async (req, res) => {
  const { buildingName, location, description, status } = req.body;

  if (!buildingName) {
    return res.status(400).json({ message: 'buildingName is required' });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('BuildingName', buildingName);
    request.input('Location', location || null);
    request.input('Description', description || null);
    request.input('Status', status || 'Active');

    const result = await request.query(`
      INSERT INTO Buildings (BuildingName, Location, Description, Status)
      OUTPUT INSERTED.BuildingID, INSERTED.BuildingName, INSERTED.Location, INSERTED.Description, INSERTED.Status
      VALUES (@BuildingName, @Location, @Description, @Status);
    `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error creating building:', err.message);
    res.status(500).json({ message: 'Failed to create building' });
  }
});

// PUT /api/buildings/:id - update building
router.put('/buildings/:id', async (req, res) => {
  const { id } = req.params;
  const { buildingName, location, description, status } = req.body;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('BuildingID', id);
    request.input('BuildingName', buildingName || null);
    request.input('Location', location || null);
    request.input('Description', description || null);
    request.input('Status', status || null);

    const result = await request.query(`
      UPDATE Buildings
      SET BuildingName = COALESCE(@BuildingName, BuildingName),
          Location = COALESCE(@Location, Location),
          Description = COALESCE(@Description, Description),
          Status = COALESCE(@Status, Status)
      OUTPUT INSERTED.BuildingID, INSERTED.BuildingName, INSERTED.Location, INSERTED.Description, INSERTED.Status
      WHERE BuildingID = @BuildingID;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating building:', err.message);
    res.status(500).json({ message: 'Failed to update building' });
  }
});

// DELETE /api/buildings/:id - delete building
router.delete('/buildings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('BuildingID', id);

    const result = await request.query(`
      DELETE FROM Buildings WHERE BuildingID = @BuildingID;
      SELECT @@ROWCOUNT AS RowsAffected;
    `);

    if (!result.recordset[0].RowsAffected) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting building:', err.message);
    res.status(500).json({ message: 'Failed to delete building' });
  }
});

export default router;
