import express from 'express';
import { getPool } from '../db/pool.js';

const router = express.Router();

// GET /api/employees - list employees
router.get('/employees', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP 100 EmployeeID, EmployeeCode, FirstName, LastName, Department, Grade, Gender, Status
      FROM Employees
      ORDER BY EmployeeID DESC
    `);
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

// POST /api/employees - create employee
router.post('/employees', async (req, res) => {
  const { employeeCode, firstName, lastName, department, grade, gender, status } = req.body;

  if (!employeeCode || !firstName || !lastName || !gender) {
    return res.status(400).json({ message: 'employeeCode, firstName, lastName, and gender are required' });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('EmployeeCode', employeeCode);
    request.input('FirstName', firstName);
    request.input('LastName', lastName);
    request.input('Department', department || null);
    request.input('Grade', grade || null);
    request.input('Gender', gender);
    request.input('Status', status || 'Active');

    const result = await request.query(`
      INSERT INTO Employees (EmployeeCode, FirstName, LastName, Department, Grade, Gender, Status)
      OUTPUT INSERTED.EmployeeID, INSERTED.EmployeeCode, INSERTED.FirstName, INSERTED.LastName,
             INSERTED.Department, INSERTED.Grade, INSERTED.Gender, INSERTED.Status
      VALUES (@EmployeeCode, @FirstName, @LastName, @Department, @Grade, @Gender, @Status);
    `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Error creating employee:', err.message);
    if (err.number === 2627) {
      return res.status(409).json({ message: 'EmployeeCode already exists' });
    }
    res.status(500).json({ message: 'Failed to create employee' });
  }
});

// PUT /api/employees/:id - update employee
router.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { employeeCode, firstName, lastName, department, grade, gender, status } = req.body;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('EmployeeID', id);
    request.input('EmployeeCode', employeeCode || null);
    request.input('FirstName', firstName || null);
    request.input('LastName', lastName || null);
    request.input('Department', department || null);
    request.input('Grade', grade || null);
    request.input('Gender', gender || null);
    request.input('Status', status || null);

    const result = await request.query(`
      UPDATE Employees
      SET EmployeeCode = COALESCE(@EmployeeCode, EmployeeCode),
          FirstName = COALESCE(@FirstName, FirstName),
          LastName = COALESCE(@LastName, LastName),
          Department = COALESCE(@Department, Department),
          Grade = COALESCE(@Grade, Grade),
          Gender = COALESCE(@Gender, Gender),
          Status = COALESCE(@Status, Status)
      OUTPUT INSERTED.EmployeeID, INSERTED.EmployeeCode, INSERTED.FirstName, INSERTED.LastName,
             INSERTED.Department, INSERTED.Grade, INSERTED.Gender, INSERTED.Status
      WHERE EmployeeID = @EmployeeID;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error updating employee:', err.message);
    res.status(500).json({ message: 'Failed to update employee' });
  }
});

// DELETE /api/employees/:id - delete employee
router.delete('/employees/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('EmployeeID', id);

    const result = await request.query(`
      DELETE FROM Employees WHERE EmployeeID = @EmployeeID;
      SELECT @@ROWCOUNT AS RowsAffected;
    `);

    if (!result.recordset[0].RowsAffected) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting employee:', err.message);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
});

export default router;
