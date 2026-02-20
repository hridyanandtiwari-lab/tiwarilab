import express from 'express';
import { getPool } from '../db/pool.js';

const router = express.Router();

// GET /api/assignments - list bed assignments with joined details
router.get('/assignments', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        a.AssignmentID,
        a.EmployeeID,
        e.EmployeeCode,
        e.FirstName,
        e.LastName,
        a.BedID,
        b.BedCode,
        r.RoomNumber,
        flt.FlatNumber,
        flr.FloorNumber,
        bld.BuildingName,
        a.StartDate,
        a.EndDate,
        a.Status,
        a.Reason,
        a.CreatedAt,
        a.CreatedBy
      FROM BedAssignments a
      JOIN Employees e ON a.EmployeeID = e.EmployeeID
      JOIN Beds b ON a.BedID = b.BedID
      JOIN Rooms r ON b.RoomID = r.RoomID
      JOIN Flats flt ON r.FlatID = flt.FlatID
      JOIN Floors flr ON flt.FloorID = flr.FloorID
      JOIN Buildings bld ON flr.BuildingID = bld.BuildingID
      ORDER BY a.AssignmentID DESC;
    `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching assignments:', err.message);
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
});

// POST /api/assignments - create bed assignment
router.post('/assignments', async (req, res) => {
  const { employeeId, bedId, startDate, endDate, status, reason, createdBy } = req.body;

  if (!employeeId || !bedId || !startDate) {
    return res.status(400).json({ message: 'employeeId, bedId and startDate are required' });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('EmployeeID', employeeId);
    request.input('BedID', bedId);
    request.input('StartDate', startDate);
    request.input('EndDate', endDate || null);
    request.input('Status', status || 'Active');
    request.input('Reason', reason || null);
    request.input('CreatedBy', createdBy || 'web');

    const result = await request.query(`
      INSERT INTO BedAssignments (EmployeeID, BedID, StartDate, EndDate, Status, Reason, CreatedBy)
      VALUES (@EmployeeID, @BedID, @StartDate, @EndDate, @Status, @Reason, @CreatedBy);

      UPDATE Beds SET Status = 'Occupied' WHERE BedID = @BedID;

      SELECT TOP 1
        a.AssignmentID,
        a.EmployeeID,
        e.EmployeeCode,
        e.FirstName,
        e.LastName,
        a.BedID,
        b.BedCode,
        r.RoomNumber,
        flt.FlatNumber,
        flr.FloorNumber,
        bld.BuildingName,
        a.StartDate,
        a.EndDate,
        a.Status,
        a.Reason,
        a.CreatedAt,
        a.CreatedBy
      FROM BedAssignments a
      JOIN Employees e ON a.EmployeeID = e.EmployeeID
      JOIN Beds b ON a.BedID = b.BedID
      JOIN Rooms r ON b.RoomID = r.RoomID
      JOIN Flats flt ON r.FlatID = flt.FlatID
      JOIN Floors flr ON flt.FloorID = flr.FloorID
      JOIN Buildings bld ON flr.BuildingID = bld.BuildingID
      WHERE a.AssignmentID = SCOPE_IDENTITY();
    `);

    // The final SELECT is in the last recordset
    const recordsets = result.recordsets;
    const finalSet = recordsets && recordsets.length > 0 ? recordsets[recordsets.length - 1] : result.recordset;

    if (!finalSet || finalSet.length === 0) {
      return res.status(500).json({ message: 'Assignment created but could not be loaded' });
    }

    res.status(201).json(finalSet[0]);
  } catch (err) {
    console.error('Error creating assignment:', err.message);
    res.status(500).json({ message: 'Failed to create assignment' });
  }
});

// PUT /api/assignments/:id - update bed assignment (dates/status/reason)
router.put('/assignments/:id', async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, status, reason } = req.body;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('AssignmentID', id);
    request.input('StartDate', startDate || null);
    request.input('EndDate', endDate || null);
    request.input('Status', status || null);
    request.input('Reason', reason || null);

    const result = await request.query(`
      DECLARE @BedID INT;
      SELECT @BedID = BedID FROM BedAssignments WHERE AssignmentID = @AssignmentID;

      UPDATE BedAssignments
      SET StartDate = COALESCE(@StartDate, StartDate),
          EndDate = @EndDate,
          Status = COALESCE(@Status, Status),
          Reason = COALESCE(@Reason, Reason)
      WHERE AssignmentID = @AssignmentID;

      IF @@ROWCOUNT = 0
      BEGIN
        SELECT CAST(0 AS INT) AS RowsAffected;
        RETURN;
      END

      -- If assignment is now Closed and no other active/planned assignments exist for this bed, free the bed
      IF @BedID IS NOT NULL AND (@Status = 'Closed')
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM BedAssignments WHERE BedID = @BedID AND Status IN ('Planned', 'Active')
        )
        BEGIN
          UPDATE Beds SET Status = 'Available' WHERE BedID = @BedID;
        END
      END

      SELECT CAST(1 AS INT) AS RowsAffected;
    `);

    const rowsInfo = result.recordset && result.recordset[0];
    if (!rowsInfo || !rowsInfo.RowsAffected) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Return the updated assignment with joined details
    const refreshed = await pool.request().input('AssignmentID', id).query(`
      SELECT
        a.AssignmentID,
        a.EmployeeID,
        e.EmployeeCode,
        e.FirstName,
        e.LastName,
        a.BedID,
        b.BedCode,
        r.RoomNumber,
        flt.FlatNumber,
        flr.FloorNumber,
        bld.BuildingName,
        a.StartDate,
        a.EndDate,
        a.Status,
        a.Reason,
        a.CreatedAt,
        a.CreatedBy
      FROM BedAssignments a
      JOIN Employees e ON a.EmployeeID = e.EmployeeID
      JOIN Beds b ON a.BedID = b.BedID
      JOIN Rooms r ON b.RoomID = r.RoomID
      JOIN Flats flt ON r.FlatID = flt.FlatID
      JOIN Floors flr ON flt.FloorID = flr.FloorID
      JOIN Buildings bld ON flr.BuildingID = bld.BuildingID
      WHERE a.AssignmentID = @AssignmentID;
    `);

    if (!refreshed.recordset || refreshed.recordset.length === 0) {
      return res.status(500).json({ message: 'Assignment updated but could not be loaded' });
    }

    res.json(refreshed.recordset[0]);
  } catch (err) {
    console.error('Error updating assignment:', err.message);
    res.status(500).json({ message: 'Failed to update assignment' });
  }
});

// DELETE /api/assignments/:id - delete bed assignment and free bed if needed
router.delete('/assignments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('AssignmentID', id);

    const result = await request.query(`
      DECLARE @BedID INT;
      SELECT @BedID = BedID FROM BedAssignments WHERE AssignmentID = @AssignmentID;

      DELETE FROM BedAssignments WHERE AssignmentID = @AssignmentID;

      IF @@ROWCOUNT = 0
      BEGIN
        SELECT CAST(0 AS INT) AS RowsAffected, @BedID AS BedID;
        RETURN;
      END

      IF @BedID IS NOT NULL
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM BedAssignments WHERE BedID = @BedID AND Status IN ('Planned', 'Active')
        )
        BEGIN
          UPDATE Beds SET Status = 'Available' WHERE BedID = @BedID;
        END
      END

      SELECT CAST(1 AS INT) AS RowsAffected, @BedID AS BedID;
    `);

    const info = result.recordset && result.recordset[0];
    if (!info || !info.RowsAffected) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json({ bedId: info.BedID });
  } catch (err) {
    console.error('Error deleting assignment:', err.message);
    res.status(500).json({ message: 'Failed to delete assignment' });
  }
});

export default router;
