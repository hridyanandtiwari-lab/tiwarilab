import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.134.22.185:5000/api';

function App() {
  const [health, setHealth] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [floors, setFloors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [empForm, setEmpForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    department: '',
    grade: '',
    gender: 'M',
  });
  const [empMessage, setEmpMessage] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [buildingForm, setBuildingForm] = useState({
    buildingName: '',
    location: '',
    description: '',
  });
  const [editingBuildingId, setEditingBuildingId] = useState(null);
  const [floorForm, setFloorForm] = useState({ buildingId: '', floorNumber: '', description: '' });
  const [editingFloorId, setEditingFloorId] = useState(null);
  const [flatForm, setFlatForm] = useState({ floorId: '', flatNumber: '', flatType: '' });
  const [editingFlatId, setEditingFlatId] = useState(null);
  const [roomForm, setRoomForm] = useState({
    flatId: '',
    roomNumber: '',
    roomType: '',
    maxOccupancy: 1,
    genderRestriction: '',
  });
  const [bedForm, setBedForm] = useState({ roomId: '', bedCode: '' });
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingBedId, setEditingBedId] = useState(null);
  const [structureMessage, setStructureMessage] = useState('');
  const [bedStatusFilter, setBedStatusFilter] = useState({
    location: '',
    buildingId: '',
    floorId: '',
    flatId: '',
    roomId: '',
  });
  const [assignmentForm, setAssignmentForm] = useState({
    employeeId: '',
    buildingId: '',
    floorId: '',
    flatId: '',
    roomId: '',
    bedId: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    status: 'Active',
    reason: '',
  });
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [buildingFilter, setBuildingFilter] = useState({
    name: '',
    location: '',
    description: '',
    status: '',
  });
  const [floorFilter, setFloorFilter] = useState({
    building: '',
    floorNumber: '',
    description: '',
  });
  const [flatFilter, setFlatFilter] = useState({
    building: '',
    floorNumber: '',
    flatNumber: '',
    flatType: '',
    status: '',
  });
  const [roomFilter, setRoomFilter] = useState({
    building: '',
    floorNumber: '',
    flatNumber: '',
    roomNumber: '',
    roomType: '',
    maxOccupancy: '',
    genderRestriction: '',
    status: '',
  });
  const [bedFilter, setBedFilter] = useState({
    building: '',
    floorNumber: '',
    flatNumber: '',
    roomNumber: '',
    bedCode: '',
    status: '',
  });
  const [employeeFilter, setEmployeeFilter] = useState({
    code: '',
    name: '',
    department: '',
    grade: '',
    gender: '',
  });
  const [assignmentFilter, setAssignmentFilter] = useState({
    employee: '',
    bed: '',
    buildingRoom: '',
    from: '',
    to: '',
    status: '',
    reason: '',
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setError('');
        const healthRes = await fetch(`${API_BASE_URL}/health`);
        const healthJson = await healthRes.json();
        setHealth(healthJson);

        const bRes = await fetch(`${API_BASE_URL}/buildings`);
        if (bRes.ok) {
          const bJson = await bRes.json();
          setBuildings(bJson);
        }

        const fRes = await fetch(`${API_BASE_URL}/floors`);
        if (fRes.ok) {
          const fJson = await fRes.json();
          setFloors(fJson);
        }

        const flRes = await fetch(`${API_BASE_URL}/flats`);
        if (flRes.ok) {
          const flJson = await flRes.json();
          setFlats(flJson);
        }

        const rRes = await fetch(`${API_BASE_URL}/rooms`);
        if (rRes.ok) {
          const rJson = await rRes.json();
          setRooms(rJson);
        }

        const bedRes = await fetch(`${API_BASE_URL}/beds`);
        if (bedRes.ok) {
          const bedJson = await bedRes.json();
          setBeds(bedJson);
        }

        const eRes = await fetch(`${API_BASE_URL}/employees`);
        if (eRes.ok) {
          const eJson = await eRes.json();
          setEmployees(eJson);
        }

        const aRes = await fetch(`${API_BASE_URL}/assignments`);
        if (aRes.ok) {
          const aJson = await aRes.json();
          setAssignments(aJson);
        }
      } catch (err) {
        setError('Unable to reach backend API');
      }
    }

    fetchData();
  }, []);

  async function handleCreateEmployee(e) {
    e.preventDefault();
    setEmpMessage('');

    try {
      let res;
      if (editingEmployeeId) {
        res = await fetch(`${API_BASE_URL}/employees/${editingEmployeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empForm),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/employees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empForm),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setEmpMessage(data.message || 'Failed to save employee');
        return;
      }

      if (editingEmployeeId) {
        setEmployees((prev) => prev.map((e) => (e.EmployeeID === editingEmployeeId ? data : e)));
        setEmpMessage('Employee updated successfully');
      } else {
        setEmployees((prev) => [data, ...prev]);
        setEmpMessage('Employee created successfully');
      }

      setEmpForm({
        employeeCode: '',
        firstName: '',
        lastName: '',
        department: '',
        grade: '',
        gender: 'M',
      });
      setEditingEmployeeId(null);
    } catch (err) {
      setEmpMessage('Error calling employee API');
    }
  }

  function startEditBuilding(b) {
    setBuildingForm({
      buildingName: b.BuildingName || '',
      location: b.Location || '',
      description: b.Description || '',
    });
    setEditingBuildingId(b.BuildingID);
    setStructureMessage('Editing building');
  }

  async function handleDeleteBuilding(id) {
    if (!window.confirm('Delete this building?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/buildings/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setBuildings((prev) => prev.filter((b) => b.BuildingID !== id));
    } catch {}
  }

  function startEditFloor(f) {
    setFloorForm({
      buildingId: String(f.BuildingID || ''),
      floorNumber: String(f.FloorNumber ?? ''),
      description: f.Description || '',
    });
    setEditingFloorId(f.FloorID);
    setStructureMessage('Editing floor');
  }

  async function handleDeleteFloor(id) {
    if (!window.confirm('Delete this floor?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/floors/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setFloors((prev) => prev.filter((f) => f.FloorID !== id));
    } catch {}
  }

  function startEditFlat(fl) {
    setFlatForm({
      floorId: String(fl.FloorID || ''),
      flatNumber: fl.FlatNumber || '',
      flatType: fl.FlatType || '',
    });
    setEditingFlatId(fl.FlatID);
    setStructureMessage('Editing flat');
  }

  async function handleDeleteFlat(id) {
    if (!window.confirm('Delete this flat?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/flats/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setFlats((prev) => prev.filter((fl) => fl.FlatID !== id));
    } catch {}
  }

  function startEditRoom(r) {
    setRoomForm({
      flatId: String(r.FlatID || ''),
      roomNumber: r.RoomNumber || '',
      roomType: r.RoomType || '',
      maxOccupancy: r.MaxOccupancy ?? 1,
      genderRestriction: r.GenderRestriction || '',
    });
    setEditingRoomId(r.RoomID);
    setStructureMessage('Editing room');
  }

  async function handleDeleteRoom(id) {
    if (!window.confirm('Delete this room?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setRooms((prev) => prev.filter((r) => r.RoomID !== id));
    } catch {}
  }

  function startEditBed(bd) {
    setBedForm({
      roomId: String(bd.RoomID || ''),
      bedCode: bd.BedCode || '',
    });
    setEditingBedId(bd.BedID);
    setStructureMessage('Editing bed');
  }

  async function handleDeleteBed(id) {
    if (!window.confirm('Delete this bed?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/beds/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setBeds((prev) => prev.filter((b) => b.BedID !== id));
    } catch {}
  }

  async function handleDeleteEmployee(id) {
    if (!window.confirm('Delete this employee?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) return;
      setEmployees((prev) => prev.filter((e) => e.EmployeeID !== id));
    } catch {}
  }

  function startEditEmployee(emp) {
    setEmpForm({
      employeeCode: emp.EmployeeCode || '',
      firstName: emp.FirstName || '',
      lastName: emp.LastName || '',
      department: emp.Department || '',
      grade: emp.Grade || '',
      gender: emp.Gender || 'M',
    });
    setEditingEmployeeId(emp.EmployeeID);
    setEmpMessage('Editing employee');
  }

  async function handleCreateBuilding(e) {
    e.preventDefault();
    setStructureMessage('');

    try {
      let res;
      if (editingBuildingId) {
        res = await fetch(`${API_BASE_URL}/buildings/${editingBuildingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildingForm),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/buildings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildingForm),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setStructureMessage(data.message || 'Failed to save building');
        return;
      }

      if (editingBuildingId) {
        setBuildings((prev) => prev.map((b) => (b.BuildingID === editingBuildingId ? data : b)));
        setStructureMessage('Building updated');
      } else {
        setBuildings((prev) => [...prev, data]);
        setStructureMessage('Building created');
      }

      setBuildingForm({ buildingName: '', location: '', description: '' });
      setEditingBuildingId(null);
    } catch {
      setStructureMessage('Error calling building API');
    }
  }

  async function handleCreateFloor(e) {
    e.preventDefault();
    setStructureMessage('');
    try {
      const payload = {
        buildingId: Number(floorForm.buildingId),
        floorNumber: Number(floorForm.floorNumber),
        description: floorForm.description,
      };
      let res;
      if (editingFloorId) {
        res = await fetch(`${API_BASE_URL}/floors/${editingFloorId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/floors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setStructureMessage(data.message || 'Failed to save floor');
        return;
      }
      if (editingFloorId) {
        setFloors((prev) => prev.map((f) => (f.FloorID === editingFloorId ? data : f)));
        setStructureMessage('Floor updated');
      } else {
        setFloors((prev) => [...prev, data]);
        setStructureMessage('Floor created');
      }
      setFloorForm({ buildingId: '', floorNumber: '', description: '' });
      setEditingFloorId(null);
    } catch {
      setStructureMessage('Error calling floor API');
    }
  }

  async function handleCreateFlat(e) {
    e.preventDefault();
    setStructureMessage('');
    try {
      const payload = {
        floorId: Number(flatForm.floorId),
        flatNumber: flatForm.flatNumber,
        flatType: flatForm.flatType,
      };
      let res;
      if (editingFlatId) {
        res = await fetch(`${API_BASE_URL}/flats/${editingFlatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/flats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setStructureMessage(data.message || 'Failed to save flat');
        return;
      }
      if (editingFlatId) {
        setFlats((prev) => prev.map((fl) => (fl.FlatID === editingFlatId ? data : fl)));
        setStructureMessage('Flat updated');
      } else {
        setFlats((prev) => [...prev, data]);
        setStructureMessage('Flat created');
      }
      setFlatForm({ floorId: '', flatNumber: '', flatType: '' });
      setEditingFlatId(null);
    } catch {
      setStructureMessage('Error calling flat API');
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault();
    setStructureMessage('');
    try {
      const payload = {
        flatId: Number(roomForm.flatId),
        roomNumber: roomForm.roomNumber,
        roomType: roomForm.roomType,
        maxOccupancy: Number(roomForm.maxOccupancy || 1),
        genderRestriction: roomForm.genderRestriction || null,
      };
      let res;
      if (editingRoomId) {
        res = await fetch(`${API_BASE_URL}/rooms/${editingRoomId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setStructureMessage(data.message || 'Failed to save room');
        return;
      }
      if (editingRoomId) {
        setRooms((prev) => prev.map((r) => (r.RoomID === editingRoomId ? data : r)));
        setStructureMessage('Room updated');
      } else {
        setRooms((prev) => [...prev, data]);
        setStructureMessage('Room created');
      }
      setRoomForm({ flatId: '', roomNumber: '', roomType: '', maxOccupancy: 1, genderRestriction: '' });
      setEditingRoomId(null);
    } catch {
      setStructureMessage('Error calling room API');
    }
  }

  async function handleCreateBed(e) {
    e.preventDefault();
    setStructureMessage('');
    try {
      const payload = {
        roomId: Number(bedForm.roomId),
        bedCode: bedForm.bedCode,
      };
      let res;
      if (editingBedId) {
        res = await fetch(`${API_BASE_URL}/beds/${editingBedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/beds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setStructureMessage(data.message || 'Failed to save bed');
        return;
      }
      if (editingBedId) {
        setBeds((prev) => prev.map((b) => (b.BedID === editingBedId ? data : b)));
        setStructureMessage('Bed updated');
      } else {
        setBeds((prev) => [...prev, data]);
        setStructureMessage('Bed created');
      }
      setBedForm({ roomId: '', bedCode: '' });
      setEditingBedId(null);
    } catch {
      setStructureMessage('Error calling bed API');
    }
  }

  // Grid filters
  const filteredBuildings = buildings.filter((b) => {
    const name = (b.BuildingName || '').toLowerCase();
    const loc = (b.Location || '').toLowerCase();
    const desc = (b.Description || '').toLowerCase();
    const status = (b.Status || '').toLowerCase();
    return (
      (!buildingFilter.name || name.includes(buildingFilter.name.toLowerCase())) &&
      (!buildingFilter.location || loc.includes(buildingFilter.location.toLowerCase())) &&
      (!buildingFilter.description || desc.includes(buildingFilter.description.toLowerCase())) &&
      (!buildingFilter.status || status.includes(buildingFilter.status.toLowerCase()))
    );
  });

  const filteredFloors = floors.filter((f) => {
    const b = (f.BuildingName || String(f.BuildingID || '')).toLowerCase();
    const num = String(f.FloorNumber ?? '').toLowerCase();
    const desc = (f.Description || '').toLowerCase();
    return (
      (!floorFilter.building || b.includes(floorFilter.building.toLowerCase())) &&
      (!floorFilter.floorNumber || num.includes(floorFilter.floorNumber.toLowerCase())) &&
      (!floorFilter.description || desc.includes(floorFilter.description.toLowerCase()))
    );
  });

  const filteredFlats = flats.filter((fl) => {
    const building = (fl.BuildingName || '').toLowerCase();
    const floor = String(fl.FloorNumber ?? '').toLowerCase();
    const num = (fl.FlatNumber || '').toLowerCase();
    const type = (fl.FlatType || '').toLowerCase();
    const status = (fl.Status || '').toLowerCase();
    return (
      (!flatFilter.building || building.includes(flatFilter.building.toLowerCase())) &&
      (!flatFilter.floorNumber || floor.includes(flatFilter.floorNumber.toLowerCase())) &&
      (!flatFilter.flatNumber || num.includes(flatFilter.flatNumber.toLowerCase())) &&
      (!flatFilter.flatType || type.includes(flatFilter.flatType.toLowerCase())) &&
      (!flatFilter.status || status.includes(flatFilter.status.toLowerCase()))
    );
  });

  const filteredRooms = rooms.filter((r) => {
    const building = (r.BuildingName || '').toLowerCase();
    const floor = String(r.FloorNumber ?? '').toLowerCase();
    const flat = (r.FlatNumber || '').toLowerCase();
    const num = (r.RoomNumber || '').toLowerCase();
    const type = (r.RoomType || '').toLowerCase();
    const max = String(r.MaxOccupancy ?? '').toLowerCase();
    const gender = (r.GenderRestriction || '').toLowerCase();
    const status = (r.Status || '').toLowerCase();
    return (
      (!roomFilter.building || building.includes(roomFilter.building.toLowerCase())) &&
      (!roomFilter.floorNumber || floor.includes(roomFilter.floorNumber.toLowerCase())) &&
      (!roomFilter.flatNumber || flat.includes(roomFilter.flatNumber.toLowerCase())) &&
      (!roomFilter.roomNumber || num.includes(roomFilter.roomNumber.toLowerCase())) &&
      (!roomFilter.roomType || type.includes(roomFilter.roomType.toLowerCase())) &&
      (!roomFilter.maxOccupancy || max.includes(roomFilter.maxOccupancy.toLowerCase())) &&
      (!roomFilter.genderRestriction || gender.includes(roomFilter.genderRestriction.toLowerCase())) &&
      (!roomFilter.status || status.includes(roomFilter.status.toLowerCase()))
    );
  });

  const filteredBeds = beds.filter((bd) => {
    const building = (bd.BuildingName || '').toLowerCase();
    const floor = String(bd.FloorNumber ?? '').toLowerCase();
    const flat = (bd.FlatNumber || '').toLowerCase();
    const room = (bd.RoomNumber || '').toLowerCase();
    const code = (bd.BedCode || '').toLowerCase();
    const status = (bd.Status || '').toLowerCase();
    return (
      (!bedFilter.building || building.includes(bedFilter.building.toLowerCase())) &&
      (!bedFilter.floorNumber || floor.includes(bedFilter.floorNumber.toLowerCase())) &&
      (!bedFilter.flatNumber || flat.includes(bedFilter.flatNumber.toLowerCase())) &&
      (!bedFilter.roomNumber || room.includes(bedFilter.roomNumber.toLowerCase())) &&
      (!bedFilter.bedCode || code.includes(bedFilter.bedCode.toLowerCase())) &&
      (!bedFilter.status || status.includes(bedFilter.status.toLowerCase()))
    );
  });

  const filteredEmployees = employees.filter((e) => {
    const code = (e.EmployeeCode || '').toLowerCase();
    const name = `${e.FirstName || ''} ${e.LastName || ''}`.toLowerCase();
    const dept = (e.Department || '').toLowerCase();
    const grade = (e.Grade || '').toLowerCase();
    const gender = (e.Gender || '').toLowerCase();
    return (
      (!employeeFilter.code || code.includes(employeeFilter.code.toLowerCase())) &&
      (!employeeFilter.name || name.includes(employeeFilter.name.toLowerCase())) &&
      (!employeeFilter.department || dept.includes(employeeFilter.department.toLowerCase())) &&
      (!employeeFilter.grade || grade.includes(employeeFilter.grade.toLowerCase())) &&
      (!employeeFilter.gender || gender.includes(employeeFilter.gender.toLowerCase()))
    );
  });

  const filteredAssignments = assignments.filter((a) => {
    const emp = `${a.EmployeeCode || ''} ${a.FirstName || ''} ${a.LastName || ''}`.toLowerCase();
    const bed = (a.BedCode || '').toLowerCase();
    const buildingRoom = `${a.BuildingName || ''} ${a.RoomNumber || ''}`.toLowerCase();
    const from = a.StartDate ? String(a.StartDate).substring(0, 10) : '';
    const to = a.EndDate ? String(a.EndDate).substring(0, 10) : '';
    const status = (a.Status || '').toLowerCase();
    const reason = (a.Reason || '').toLowerCase();
    return (
      (!assignmentFilter.employee || emp.includes(assignmentFilter.employee.toLowerCase())) &&
      (!assignmentFilter.bed || bed.includes(assignmentFilter.bed.toLowerCase())) &&
      (!assignmentFilter.buildingRoom ||
        buildingRoom.includes(assignmentFilter.buildingRoom.toLowerCase())) &&
      (!assignmentFilter.from || from.includes(assignmentFilter.from)) &&
      (!assignmentFilter.to || to.includes(assignmentFilter.to)) &&
      (!assignmentFilter.status || status.includes(assignmentFilter.status.toLowerCase())) &&
      (!assignmentFilter.reason || reason.includes(assignmentFilter.reason.toLowerCase()))
    );
  });

  function downloadBlob(content, mimeType, filename) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportTableToCSV(headers, rows, filename) {
    const escapeCell = (cell) => {
      const value = cell == null ? '' : String(cell);
      if (value.includes('"') || value.includes(',') || value.includes('\n')) {
        return '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    };

    const csvLines = [
      headers.map(escapeCell).join(','),
      ...rows.map((r) => r.map(escapeCell).join(',')),
    ];

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    downloadBlob(csvContent, 'text/csv;charset=utf-8;', filename);
  }

  function exportTableToExcel(headers, rows, filename) {
    const data = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const safeName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    downloadBlob(blob, '', safeName);
  }

  function exportTableToPDF(headers, rows, title, filename) {
    const htmlHeader =
      '<tr>' + headers.map((h) => `<th style="text-align:left; padding:4px;">${String(h || '')}</th>`).join('') + '</tr>';
    const htmlRows = rows
      .map(
        (r) =>
          '<tr>' +
          r
            .map(
              (cell) =>
                `<td style="text-align:left; padding:4px; border-top:1px solid #ccc;">${
                  cell == null ? '' : String(cell)
                }</td>`
            )
            .join('') +
          '</tr>'
      )
      .join('');

    const docHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${
      title || ''
    }</title></head><body><h2>${title || ''}</h2><table style="border-collapse:collapse; font-family:Arial, sans-serif; font-size:12px;" border="1" cellspacing="0" cellpadding="4"><thead>${htmlHeader}</thead><tbody>${htmlRows}</tbody></table></body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(docHtml);
    win.document.close();
    win.focus();
    win.print();
  }

  function handleImportBuildingsFromExcel(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        let success = 0;
        let failed = 0;

        for (const row of rows) {
          const buildingName =
            row.BuildingName ||
            row.Building ||
            row.Name ||
            row['Building Name'] ||
            '';

          if (!buildingName) {
            failed += 1;
            continue;
          }

          const payload = {
            buildingName,
            location: row.Location || row['Location Name'] || '',
            description: row.Description || '',
            status: row.Status || 'Active',
          };

          try {
            const res = await fetch(`${API_BASE_URL}/buildings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              failed += 1;
              // eslint-disable-next-line no-continue
              continue;
            }

            const created = await res.json();
            success += 1;
            setBuildings((prev) => [...prev, created]);
          } catch {
            failed += 1;
          }
        }

        if (success === 0 && failed === 0) {
          setStructureMessage('No rows found in Excel for buildings.');
        } else if (failed === 0) {
          setStructureMessage(`Imported ${success} building(s) from Excel.`);
        } else {
          setStructureMessage(
            `Imported ${success} building(s); ${failed} row(s) failed.`
          );
        }
      } catch {
        setStructureMessage('Failed to import buildings from Excel.');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  function handleImportFloorsFromExcel(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        let success = 0;
        let failed = 0;

        for (const row of rows) {
          const rawBuilding =
            row.BuildingID ?? row.Building ?? row.BuildingName ?? row['Building Name'] ?? '';
          let buildingId = null;
          if (rawBuilding !== '') {
            const rawStr = String(rawBuilding).trim();
            const asNum = Number(rawStr);
            if (!Number.isNaN(asNum)) {
              buildingId = asNum;
            } else {
              const byName = buildings.find(
                (b) => (b.BuildingName || '').toLowerCase() === rawStr.toLowerCase()
              );
              if (byName) buildingId = byName.BuildingID;
            }
          }

          const rawFloor = row.FloorNumber ?? row.Floor ?? row['Floor No'] ?? '';
          let floorNumber = null;
          if (rawFloor !== '') {
            const fNum = Number(String(rawFloor).trim());
            if (!Number.isNaN(fNum)) floorNumber = fNum;
          }

          if (!buildingId || floorNumber === null) {
            failed += 1;
          } else {
            const payload = {
              buildingId,
              floorNumber,
              description: row.Description || '',
            };

            try {
              const res = await fetch(`${API_BASE_URL}/floors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              if (!res.ok) {
                failed += 1;
              } else {
                const created = await res.json();
                success += 1;
                setFloors((prev) => [...prev, created]);
              }
            } catch {
              failed += 1;
            }
          }
        }

        if (success === 0 && failed === 0) {
          setStructureMessage('No rows found in Excel for floors.');
        } else if (failed === 0) {
          setStructureMessage(`Imported ${success} floor(s) from Excel.`);
        } else {
          setStructureMessage(
            `Imported ${success} floor(s); ${failed} row(s) failed.`
          );
        }
      } catch {
        setStructureMessage('Failed to import floors from Excel.');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  function handleImportFlatsFromExcel(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        let success = 0;
        let failed = 0;

        for (const row of rows) {
          const rawFloorId = row.FloorID ?? row['Floor ID'] ?? '';
          let floorId = null;
          if (rawFloorId !== '') {
            const fId = Number(String(rawFloorId).trim());
            if (!Number.isNaN(fId)) floorId = fId;
          }

          if (!floorId) {
            const rawBuilding =
              row.BuildingID ?? row.Building ?? row.BuildingName ?? row['Building Name'] ?? '';
            const rawFloor = row.FloorNumber ?? row.Floor ?? row['Floor No'] ?? '';
            let buildingId = null;
            if (rawBuilding !== '') {
              const rawStr = String(rawBuilding).trim();
              const asNum = Number(rawStr);
              if (!Number.isNaN(asNum)) {
                buildingId = asNum;
              } else {
                const byName = buildings.find(
                  (b) => (b.BuildingName || '').toLowerCase() === rawStr.toLowerCase()
                );
                if (byName) buildingId = byName.BuildingID;
              }
            }
            let floorNumber = null;
            if (rawFloor !== '') {
              const fNum = Number(String(rawFloor).trim());
              if (!Number.isNaN(fNum)) floorNumber = fNum;
            }
            if (buildingId && floorNumber !== null) {
              const floor = floors.find(
                (f) => f.BuildingID === buildingId && f.FloorNumber === floorNumber
              );
              if (floor) floorId = floor.FloorID;
            }
          }

          const flatNumber =
            row.FlatNumber || row.Flat || row['Flat No'] || row['Flat'] || '';

          if (!floorId || !flatNumber) {
            failed += 1;
          } else {
            const payload = {
              floorId,
              flatNumber,
              flatType: row.FlatType || row.Type || '',
            };

            try {
              const res = await fetch(`${API_BASE_URL}/flats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              if (!res.ok) {
                failed += 1;
              } else {
                const created = await res.json();
                success += 1;
                setFlats((prev) => [...prev, created]);
              }
            } catch {
              failed += 1;
            }
          }
        }

        if (success === 0 && failed === 0) {
          setStructureMessage('No rows found in Excel for flats.');
        } else if (failed === 0) {
          setStructureMessage(`Imported ${success} flat(s) from Excel.`);
        } else {
          setStructureMessage(
            `Imported ${success} flat(s); ${failed} row(s) failed.`
          );
        }
      } catch {
        setStructureMessage('Failed to import flats from Excel.');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  function handleImportRoomsFromExcel(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        let success = 0;
        let failed = 0;

        for (const row of rows) {
          const rawFlatId = row.FlatID ?? row['Flat ID'] ?? '';
          let flatId = null;
          if (rawFlatId !== '') {
            const fId = Number(String(rawFlatId).trim());
            if (!Number.isNaN(fId)) flatId = fId;
          }

          const roomNumber = row.RoomNumber || row.Room || row['Room No'] || '';

          if (!flatId) {
            const rawBuilding =
              row.BuildingID ?? row.Building ?? row.BuildingName ?? row['Building Name'] ?? '';
            const rawFloor = row.FloorNumber ?? row.Floor ?? row['Floor No'] ?? '';
            const rawFlat = row.FlatNumber || row.Flat || row['Flat No'] || '';
            let buildingId = null;
            if (rawBuilding !== '') {
              const rawStr = String(rawBuilding).trim();
              const asNum = Number(rawStr);
              if (!Number.isNaN(asNum)) {
                buildingId = asNum;
              } else {
                const byName = buildings.find(
                  (b) => (b.BuildingName || '').toLowerCase() === rawStr.toLowerCase()
                );
                if (byName) buildingId = byName.BuildingID;
              }
            }
            let floorNumber = null;
            if (rawFloor !== '') {
              const fNum = Number(String(rawFloor).trim());
              if (!Number.isNaN(fNum)) floorNumber = fNum;
            }
            if (buildingId && floorNumber !== null && rawFlat) {
              const floor = floors.find(
                (f) => f.BuildingID === buildingId && f.FloorNumber === floorNumber
              );
              if (floor) {
                const flat = flats.find(
                  (fl) => fl.FloorID === floor.FloorID && fl.FlatNumber === String(rawFlat)
                );
                if (flat) flatId = flat.FlatID;
              }
            }
          }

          if (!flatId || !roomNumber) {
            failed += 1;
          } else {
            const maxOccRaw =
              row.MaxOccupancy ?? row.Capacity ?? row['Max Occ'] ?? row['Capacity'];
            let maxOccupancy = Number(maxOccRaw);
            if (Number.isNaN(maxOccupancy) || !maxOccupancy) {
              maxOccupancy = 1;
            }

            const payload = {
              flatId,
              roomNumber,
              roomType: row.RoomType || row.Type || '',
              maxOccupancy,
              genderRestriction: row.Gender || row.GenderRestriction || null,
            };

            try {
              const res = await fetch(`${API_BASE_URL}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              if (!res.ok) {
                failed += 1;
              } else {
                const created = await res.json();
                success += 1;
                setRooms((prev) => [...prev, created]);
              }
            } catch {
              failed += 1;
            }
          }
        }

        if (success === 0 && failed === 0) {
          setStructureMessage('No rows found in Excel for rooms.');
        } else if (failed === 0) {
          setStructureMessage(`Imported ${success} room(s) from Excel.`);
        } else {
          setStructureMessage(
            `Imported ${success} room(s); ${failed} row(s) failed.`
          );
        }
      } catch {
        setStructureMessage('Failed to import rooms from Excel.');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  function handleImportBedsFromExcel(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        let success = 0;
        let failed = 0;

        for (const row of rows) {
          const rawRoomId = row.RoomID ?? row['Room ID'] ?? '';
          let roomId = null;
          if (rawRoomId !== '') {
            const rId = Number(String(rawRoomId).trim());
            if (!Number.isNaN(rId)) roomId = rId;
          }

          const bedCode = row.BedCode || row.Bed || row['Bed Code'] || '';

          if (!roomId) {
            const rawBuilding =
              row.BuildingID ?? row.Building ?? row.BuildingName ?? row['Building Name'] ?? '';
            const rawFloor = row.FloorNumber ?? row.Floor ?? row['Floor No'] ?? '';
            const rawFlat = row.FlatNumber || row.Flat || row['Flat No'] || '';
            const rawRoom = row.RoomNumber || row.Room || row['Room No'] || '';
            let buildingId = null;
            if (rawBuilding !== '') {
              const rawStr = String(rawBuilding).trim();
              const asNum = Number(rawStr);
              if (!Number.isNaN(asNum)) {
                buildingId = asNum;
              } else {
                const byName = buildings.find(
                  (b) => (b.BuildingName || '').toLowerCase() === rawStr.toLowerCase()
                );
                if (byName) buildingId = byName.BuildingID;
              }
            }
            let floorNumber = null;
            if (rawFloor !== '') {
              const fNum = Number(String(rawFloor).trim());
              if (!Number.isNaN(fNum)) floorNumber = fNum;
            }
            if (buildingId && floorNumber !== null && rawFlat && rawRoom) {
              const floor = floors.find(
                (f) => f.BuildingID === buildingId && f.FloorNumber === floorNumber
              );
              if (floor) {
                const flat = flats.find(
                  (fl) => fl.FloorID === floor.FloorID && fl.FlatNumber === String(rawFlat)
                );
                if (flat) {
                  const room = rooms.find(
                    (r) => r.FlatID === flat.FlatID && r.RoomNumber === String(rawRoom)
                  );
                  if (room) roomId = room.RoomID;
                }
              }
            }
          }

          if (!roomId || !bedCode) {
            failed += 1;
          } else {
            const payload = {
              roomId,
              bedCode,
            };

            try {
              const res = await fetch(`${API_BASE_URL}/beds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              if (!res.ok) {
                failed += 1;
              } else {
                const created = await res.json();
                success += 1;
                setBeds((prev) => [...prev, created]);
              }
            } catch {
              failed += 1;
            }
          }
        }

        if (success === 0 && failed === 0) {
          setStructureMessage('No rows found in Excel for beds.');
        } else if (failed === 0) {
          setStructureMessage(`Imported ${success} bed(s) from Excel.`);
        } else {
          setStructureMessage(
            `Imported ${success} bed(s); ${failed} row(s) failed.`
          );
        }
      } catch {
        setStructureMessage('Failed to import beds from Excel.');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  function handleImportEmployeesFromExcel(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        let success = 0;
        let failed = 0;

        for (const row of rows) {
          const employeeCode =
            row.EmployeeCode ||
            row.Code ||
            row['Employee Code'] ||
            row.EmpCode ||
            row['Emp Code'] ||
            row.EmployeeID ||
            row['Employee Id'] ||
            '';

          let firstName = row.FirstName || row['First Name'] || '';
          let lastName = row.LastName || row['Last Name'] || '';

          const fullName = row.Name || row['Employee Name'] || '';
          if ((!firstName || !lastName) && fullName) {
            const parts = String(fullName).trim().split(/\s+/);
            if (parts.length >= 2) {
              firstName = firstName || parts[0];
              lastName = lastName || parts.slice(1).join(' ');
            } else if (parts.length === 1) {
              if (!firstName && !lastName) {
                firstName = parts[0];
                lastName = parts[0];
              } else if (!firstName) {
                firstName = parts[0];
              } else if (!lastName) {
                lastName = parts[0];
              }
            }
          }

          if (!employeeCode || !firstName || !lastName) {
            failed += 1;
          } else {
            const genderRaw = String(row.Gender || 'M').trim().toUpperCase();
            const gender = genderRaw.startsWith('F') ? 'F' : 'M';

            const payload = {
              employeeCode,
              firstName,
              lastName,
              // Support both correct and common-typo header for Department
              department: row.Department || row.Departmer || '',
              grade: row.Grade || '',
              gender,
            };

            try {
              const res = await fetch(`${API_BASE_URL}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              if (!res.ok) {
                // Attempt to read server error message if available
                let errMsg = '';
                try {
                  const errJson = await res.json();
                  errMsg = errJson && errJson.message ? ` (${errJson.message})` : '';
                } catch {}
                failed += 1;
                console.error('Employee import row failed', res.status, errMsg);
              } else {
                const created = await res.json();
                success += 1;
                setEmployees((prev) => [created, ...prev]);
              }
            } catch (err) {
              failed += 1;
              console.error('Employee import row error', err);
            }
          }
        }

        if (success === 0 && failed === 0) {
          setEmpMessage('No rows found in Excel for employees.');
        } else if (failed === 0) {
          setEmpMessage(`Imported ${success} employee(s) from Excel.`);
        } else {
          setEmpMessage(
            `Imported ${success} employee(s); ${failed} row(s) failed.`
          );
        }
      } catch (err) {
        console.error('Employee import failed', err);
        setEmpMessage('Failed to import employees from Excel.');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  async function reloadBeds() {
    try {
      const bedRes = await fetch(`${API_BASE_URL}/beds`);
      if (bedRes.ok) {
        const bedJson = await bedRes.json();
        setBeds(bedJson);
      }
    } catch {
      // ignore reload errors
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    setAssignmentMessage('');

    try {
      const payload = {
        employeeId: Number(assignmentForm.employeeId),
        bedId: Number(assignmentForm.bedId),
        startDate: assignmentForm.startDate,
        endDate: assignmentForm.endDate || null,
        status: assignmentForm.status,
        reason: assignmentForm.reason,
      };

      let res;
      if (editingAssignmentId) {
        res = await fetch(`${API_BASE_URL}/assignments/${editingAssignmentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: payload.startDate,
            endDate: payload.endDate,
            status: payload.status,
            reason: payload.reason,
          }),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/assignments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setAssignmentMessage(data.message || 'Failed to save assignment');
        return;
      }

      if (editingAssignmentId) {
        setAssignments((prev) =>
          prev.map((a) => (a.AssignmentID === editingAssignmentId ? data : a))
        );
        setAssignmentMessage('Assignment updated');
      } else {
        setAssignments((prev) => [data, ...prev]);
        setAssignmentMessage('Assignment created');
      }

      await reloadBeds();

      setAssignmentForm({
        employeeId: '',
        buildingId: '',
        floorId: '',
        flatId: '',
        roomId: '',
        bedId: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        status: 'Active',
        reason: '',
      });
      setEditingAssignmentId(null);
    } catch {
      setAssignmentMessage('Error calling assignments API');
    }
  }

  function startEditAssignment(a) {
    let buildingId = '';
    let floorId = '';
    let flatId = '';
    let roomId = '';

    const bed = beds.find((b) => b.BedID === a.BedID);
    if (bed) {
      const floor = floors.find(
        (f) => f.BuildingID === bed.BuildingID && f.FloorNumber === bed.FloorNumber
      );
      if (floor) {
        buildingId = String(floor.BuildingID);
        floorId = String(floor.FloorID);
        const flat = flats.find(
          (fl) => fl.FloorID === floor.FloorID && fl.FlatNumber === bed.FlatNumber
        );
        if (flat) {
          flatId = String(flat.FlatID);
        }
      }
      const room = rooms.find((r) => r.RoomID === bed.RoomID);
      if (room) {
        roomId = String(room.RoomID);
      }
    }

    setAssignmentForm({
      employeeId: String(a.EmployeeID || ''),
      buildingId,
      floorId,
      flatId,
      roomId,
      bedId: String(a.BedID || ''),
      startDate: a.StartDate ? String(a.StartDate).substring(0, 10) : new Date().toISOString().slice(0, 10),
      endDate: a.EndDate ? String(a.EndDate).substring(0, 10) : '',
      status: a.Status || 'Active',
      reason: a.Reason || '',
    });
    setEditingAssignmentId(a.AssignmentID);
    setAssignmentMessage('Editing assignment');
  }

  async function handleDeleteAssignment(id, bedId) {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/assignments/${id}`, { method: 'DELETE' });
      if (!res.ok) return;

      setAssignments((prev) => prev.filter((a) => a.AssignmentID !== id));
      await reloadBeds();
    } catch {
      // ignore delete errors for now
    }
  }

  return (
    <div className="app-shell">
      <aside className={sidebarCollapsed ? 'sidebar sidebar-collapsed' : 'sidebar'}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            SAMS
            <div style={{ fontSize: '0.75rem', fontWeight: 400 }}>Accommodation</div>
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>
        <ul className="sidebar-nav">
          <li
            className={activeMenu === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveMenu('dashboard')}
          >
            Dashboard
          </li>
          <li
            className={activeMenu === 'buildings' ? 'active' : ''}
            onClick={() => setActiveMenu('buildings')}
          >
            Buildings
          </li>
          <li
            className={activeMenu === 'floors' ? 'active' : ''}
            onClick={() => setActiveMenu('floors')}
          >
            Floors
          </li>
          <li
            className={activeMenu === 'flats' ? 'active' : ''}
            onClick={() => setActiveMenu('flats')}
          >
            Flats
          </li>
          <li
            className={activeMenu === 'rooms' ? 'active' : ''}
            onClick={() => setActiveMenu('rooms')}
          >
            Rooms
          </li>
          <li
            className={activeMenu === 'beds' ? 'active' : ''}
            onClick={() => setActiveMenu('beds')}
          >
            Beds
          </li>
          <li
            className={activeMenu === 'bedStatus' ? 'active' : ''}
            onClick={() => setActiveMenu('bedStatus')}
          >
            Bed Status
          </li>
          <li
            className={activeMenu === 'employees' ? 'active' : ''}
            onClick={() => setActiveMenu('employees')}
          >
            Employees
          </li>
          <li
            className={activeMenu === 'assignments' ? 'active' : ''}
            onClick={() => setActiveMenu('assignments')}
          >
            Bed Assignments
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <h1>Accommodation Management System</h1>
        {activeMenu === 'dashboard' && (
          <>
            <div className="section">
              <h2>API Health</h2>
              {health ? (
                <pre>{JSON.stringify(health, null, 2)}</pre>
              ) : (
                <p>Checking backend health...</p>
              )}
              {error && <p className="error">{error}</p>}
            </div>

            <div className="section">
              <h2>Buildings</h2>
              {buildings.length === 0 ? (
                <p>No buildings found (or DB not configured yet).</p>
              ) : (
                <ul>
                  {buildings.map((b) => (
                    <li key={b.BuildingID}>
                      <strong>{b.BuildingName}</strong> - {b.Location} ({b.Status})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="section">
              <h2>Bed Occupancy</h2>
              {beds.length === 0 ? (
                <p className="muted">No beds defined yet.</p>
              ) : (
                (() => {
                  const total = beds.length;
                  const occupied = beds.filter((b) => b.Status === 'Occupied').length;
                  const available = beds.filter((b) => b.Status === 'Available').length;
                  const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
                  const bedOccupancyPieData = {
                    labels: ['Occupied', 'Available'],
                    datasets: [
                      {
                        data: [occupied, available],
                        backgroundColor: ['#f97316', '#22c55e'],
                        borderColor: ['#ea580c', '#16a34a'],
                        borderWidth: 1,
                      },
                    ],
                  };

                  const bedsPerBuildingMap = {};
                  beds.forEach((bed) => {
                    const room = rooms.find((r) => r.RoomID === bed.RoomID);
                    if (!room) return;
                    const flat = flats.find((fl) => fl.FlatID === room.FlatID);
                    if (!flat) return;
                    const floor = floors.find((f) => f.FloorID === flat.FloorID);
                    if (!floor) return;
                    const building = buildings.find((b) => b.BuildingID === floor.BuildingID);
                    if (!building) return;
                    const key = building.BuildingID;
                    if (!bedsPerBuildingMap[key]) {
                      bedsPerBuildingMap[key] = {
                        label: building.BuildingName || `Building ${building.BuildingID}`,
                        total: 0,
                        occupied: 0,
                        available: 0,
                      };
                    }
                    bedsPerBuildingMap[key].total += 1;
                    if (bed.Status === 'Occupied') bedsPerBuildingMap[key].occupied += 1;
                    if (bed.Status === 'Available') bedsPerBuildingMap[key].available += 1;
                  });

                  const bedsPerBuilding = Object.values(bedsPerBuildingMap).reduce(
                    (acc, item) => {
                      acc.labels.push(item.label);
                      acc.total.push(item.total);
                      acc.occupied.push(item.occupied);
                      acc.available.push(item.available);
                      return acc;
                    },
                    { labels: [], total: [], occupied: [], available: [] }
                  );

                  const bedsPerBuildingBarData = {
                    labels: bedsPerBuilding.labels,
                    datasets: [
                      {
                        label: 'Total Beds',
                        data: bedsPerBuilding.total,
                        backgroundColor: '#3b82f6',
                      },
                    ],
                  };

                  const bedsPerBuildingOccBarData = {
                    labels: bedsPerBuilding.labels,
                    datasets: [
                      {
                        label: 'Occupied',
                        data: bedsPerBuilding.occupied,
                        backgroundColor: '#f97316',
                      },
                      {
                        label: 'Available',
                        data: bedsPerBuilding.available,
                        backgroundColor: '#22c55e',
                      },
                    ],
                  };

                  return (
                    <>
                      <ul>
                        <li>Total beds: {total}</li>
                        <li>Occupied beds: {occupied}</li>
                        <li>Available beds: {available}</li>
                        <li>Occupancy: {percent}%</li>
                      </ul>
                      <div className="dashboard-charts">
                        <div className="dashboard-chart-card">
                          <h3>Overall Bed Occupancy</h3>
                          <Pie data={bedOccupancyPieData} />
                        </div>
                        {bedsPerBuilding.labels.length > 0 && (
                          <>
                            <div className="dashboard-chart-card">
                              <h3>Total Beds per Building</h3>
                              <Bar
                                data={bedsPerBuildingBarData}
                                options={{
                                  responsive: true,
                                  plugins: { legend: { display: false } },
                                }}
                              />
                            </div>
                            <div className="dashboard-chart-card">
                              <h3>Occupancy by Building</h3>
                              <Bar
                                data={bedsPerBuildingOccBarData}
                                options={{
                                  responsive: true,
                                  plugins: { legend: { position: 'bottom' } },
                                  scales: {
                                    x: { stacked: true },
                                    y: { stacked: true },
                                  },
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()
              )}
            </div>

            <div className="section">
              <h2>Employees Overview</h2>
              {employees.length === 0 ? (
                <p className="muted">No employees found.</p>
              ) : (
                (() => {
                  const employeesPerDeptMap = {};
                  employees.forEach((emp) => {
                    const key = emp.Department || 'Unassigned';
                    if (!employeesPerDeptMap[key]) {
                      employeesPerDeptMap[key] = 0;
                    }
                    employeesPerDeptMap[key] += 1;
                  });

                  const employeesPerDept = Object.entries(employeesPerDeptMap).reduce(
                    (acc, [dept, count]) => {
                      acc.labels.push(dept);
                      acc.data.push(count);
                      return acc;
                    },
                    { labels: [], data: [] }
                  );

                  const employeesPerDeptBarData = {
                    labels: employeesPerDept.labels,
                    datasets: [
                      {
                        label: 'Employees per Department',
                        data: employeesPerDept.data,
                        backgroundColor: '#10b981',
                      },
                    ],
                  };

                  const genderCounts = employees.reduce(
                    (acc, emp) => {
                      const g = (emp.Gender || '').toUpperCase();
                      if (g === 'M') acc.male += 1;
                      else if (g === 'F') acc.female += 1;
                      else acc.other += 1;
                      return acc;
                    },
                    { male: 0, female: 0, other: 0 }
                  );

                  const employeeGenderPieData = {
                    labels: ['Male', 'Female', 'Other'],
                    datasets: [
                      {
                        data: [genderCounts.male, genderCounts.female, genderCounts.other],
                        backgroundColor: ['#3b82f6', '#ec4899', '#9ca3af'],
                        borderColor: ['#1d4ed8', '#be185d', '#6b7280'],
                        borderWidth: 1,
                      },
                    ],
                  };

                  return (
                    <div className="dashboard-charts">
                      {employeesPerDept.labels.length > 0 && (
                        <div className="dashboard-chart-card">
                          <h3>Employees per Department</h3>
                          <Bar
                            data={employeesPerDeptBarData}
                            options={{
                              responsive: true,
                              plugins: { legend: { display: false } },
                            }}
                          />
                        </div>
                      )}
                      <div className="dashboard-chart-card">
                        <h3>Employee Gender Split</h3>
                        <Pie data={employeeGenderPieData} />
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            <div className="section">
              <h2>Assignments Over Time</h2>
              {assignments.length === 0 ? (
                <p className="muted">No assignments yet.</p>
              ) : (
                (() => {
                  const countsByDate = assignments.reduce(
                    (acc, a) => {
                      const d = a.StartDate ? String(a.StartDate).substring(0, 10) : '';
                      if (!d) return acc;
                      if (!acc[d]) acc[d] = 0;
                      acc[d] += 1;
                      return acc;
                    },
                    {}
                  );

                  const sortedDates = Object.keys(countsByDate).sort();
                  const assignmentsPerDayData = {
                    labels: sortedDates,
                    datasets: [
                      {
                        label: 'New Assignments',
                        data: sortedDates.map((d) => countsByDate[d]),
                        backgroundColor: '#6366f1',
                      },
                    ],
                  };

                  return (
                    <div className="dashboard-charts">
                      <div className="dashboard-chart-card" style={{ minWidth: '260px' }}>
                        <h3>New Assignments per Day</h3>
                        <Bar
                          data={assignmentsPerDayData}
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: {
                              x: { ticks: { maxRotation: 45, minRotation: 45 } },
                            },
                          }}
                        />
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </>
        )}

        {activeMenu === 'buildings' && (
          <>
            <div className="section">
              <h2>{editingBuildingId ? 'Edit Building' : 'Create Building'}</h2>
              <form onSubmit={handleCreateBuilding} className="form-grid">
                <div className="form-field">
                  <label>Building Name*</label>
                  <input
                    value={buildingForm.buildingName}
                    onChange={(e) => setBuildingForm({ ...buildingForm, buildingName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Area</label>
                  <input
                    value={buildingForm.location}
                    onChange={(e) => setBuildingForm({ ...buildingForm, location: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <input
                    value={buildingForm.description}
                    onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="primary-btn">
                  {editingBuildingId ? 'Update Building' : 'Save Building'}
                </button>
                {editingBuildingId && (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginLeft: '0.5rem', backgroundColor: '#6b7280' }}
                    onClick={() => {
                      setEditingBuildingId(null);
                      setBuildingForm({ buildingName: '', location: '', description: '' });
                      setStructureMessage('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="section">
              <h2>Buildings</h2>
              {buildings.length === 0 ? (
                <p className="muted">No buildings yet.</p>
              ) : (
                <>
                  <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Area', 'Description', 'Status'];
                        const rows = filteredBuildings.map((b) => [
                          b.BuildingName || '',
                          b.Location || '',
                          b.Description || '',
                          b.Status || '',
                        ]);
                        exportTableToCSV(headers, rows, 'buildings.csv');
                      }}
                      style={{ marginRight: '0.25rem' }}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Area', 'Description', 'Status'];
                        const rows = filteredBuildings.map((b) => [
                          b.BuildingName || '',
                          b.Location || '',
                          b.Description || '',
                          b.Status || '',
                        ]);
                        exportTableToExcel(headers, rows, 'buildings.xlsx');
                      }}
                      style={{ marginRight: '0.25rem', backgroundColor: '#4b5563' }}
                    >
                      Export Excel
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Area', 'Description', 'Status'];
                        const rows = filteredBuildings.map((b) => [
                          b.BuildingName || '',
                          b.Location || '',
                          b.Description || '',
                          b.Status || '',
                        ]);
                        exportTableToPDF(headers, rows, 'Buildings', 'buildings.pdf');
                      }}
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      Export PDF
                    </button>
                    <label
                      style={{ fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.375rem',
                          border: '1px dashed #9ca3af',
                          backgroundColor: '#f9fafb',
                          marginLeft: '0.25rem',
                          display: 'inline-block',
                        }}
                      >
                        Import Excel
                      </span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            handleImportBuildingsFromExcel(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="data-grid">
                    <table>
                    <thead>
                      <tr>
                        <th>Building</th>
                        <th>Area</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                      <tr>
                        <th>
                          <input
                            placeholder="Filter"
                            list="building-name-options"
                            value={buildingFilter.name}
                            onChange={(e) =>
                              setBuildingFilter({ ...buildingFilter, name: e.target.value })
                            }
                          />
                          <datalist id="building-name-options">
                            {Array.from(new Set(buildings.map((b) => b.BuildingName || ''))) 
                              .filter((v) => v)
                              .map((name) => (
                                <option key={name} value={name} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="building-area-options"
                            value={buildingFilter.location}
                            onChange={(e) =>
                              setBuildingFilter({
                                ...buildingFilter,
                                location: e.target.value,
                              })
                            }
                          />
                          <datalist id="building-area-options">
                            {Array.from(new Set(buildings.map((b) => b.Location || ''))) 
                              .filter((v) => v)
                              .map((loc) => (
                                <option key={loc} value={loc} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="building-desc-options"
                            value={buildingFilter.description}
                            onChange={(e) =>
                              setBuildingFilter({
                                ...buildingFilter,
                                description: e.target.value,
                              })
                            }
                          />
                          <datalist id="building-desc-options">
                            {Array.from(new Set(buildings.map((b) => b.Description || ''))) 
                              .filter((v) => v)
                              .map((d) => (
                                <option key={d} value={d} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="building-status-options"
                            value={buildingFilter.status}
                            onChange={(e) =>
                              setBuildingFilter({ ...buildingFilter, status: e.target.value })
                            }
                          />
                          <datalist id="building-status-options">
                            {Array.from(new Set(buildings.map((b) => b.Status || ''))) 
                              .filter((v) => v)
                              .map((s) => (
                                <option key={s} value={s} />
                              ))}
                          </datalist>
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBuildings.map((b) => (
                        <tr key={b.BuildingID}>
                          <td>{b.BuildingName}</td>
                          <td>{b.Location}</td>
                          <td>{b.Description}</td>
                          <td>{b.Status}</td>
                          <td>
                            <span className="row-actions">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => startEditBuilding(b)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="icon-btn danger"
                                onClick={() => handleDeleteBuilding(b.BuildingID)}
                              >
                                Del
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
              {structureMessage && (
                <p className="muted">{structureMessage}</p>
              )}
            </div>
          </>
        )}

        {activeMenu === 'floors' && (
          <>
            <div className="section">
              <h2>{editingFloorId ? 'Edit Floor' : 'Create Floor'}</h2>
              <form onSubmit={handleCreateFloor} className="form-grid">
                <div className="form-field">
                  <label>Building*</label>
                  <select
                    value={floorForm.buildingId}
                    onChange={(e) => setFloorForm({ ...floorForm, buildingId: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    {buildings.map((b) => (
                      <option key={b.BuildingID} value={b.BuildingID}>
                        {b.BuildingName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Floor Number*</label>
                  <input
                    type="number"
                    value={floorForm.floorNumber}
                    onChange={(e) => setFloorForm({ ...floorForm, floorNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <input
                    value={floorForm.description}
                    onChange={(e) => setFloorForm({ ...floorForm, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="primary-btn">
                  {editingFloorId ? 'Update Floor' : 'Save Floor'}
                </button>
                {editingFloorId && (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginLeft: '0.5rem', backgroundColor: '#6b7280' }}
                    onClick={() => {
                      setEditingFloorId(null);
                      setFloorForm({ buildingId: '', floorNumber: '', description: '' });
                      setStructureMessage('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="section">
              <h2>Floors</h2>
              {floors.length === 0 ? (
                <p className="muted">No floors yet.</p>
              ) : (
                <>
                  <div
                    style={{
                      marginBottom: '0.5rem',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Description'];
                        const rows = filteredFloors.map((f) => [
                          f.BuildingName || f.BuildingID || '',
                          f.FloorNumber ?? '',
                          f.Description || '',
                        ]);
                        exportTableToCSV(headers, rows, 'floors.csv');
                      }}
                      style={{ marginRight: '0.25rem' }}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Description'];
                        const rows = filteredFloors.map((f) => [
                          f.BuildingName || f.BuildingID || '',
                          f.FloorNumber ?? '',
                          f.Description || '',
                        ]);
                        exportTableToExcel(headers, rows, 'floors.xlsx');
                      }}
                      style={{ marginRight: '0.25rem', backgroundColor: '#4b5563' }}
                    >
                      Export Excel
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Description'];
                        const rows = filteredFloors.map((f) => [
                          f.BuildingName || f.BuildingID || '',
                          f.FloorNumber ?? '',
                          f.Description || '',
                        ]);
                        exportTableToPDF(headers, rows, 'Floors', 'floors.pdf');
                      }}
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      Export PDF
                    </button>
                    <label
                      style={{ fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.375rem',
                          border: '1px dashed #9ca3af',
                          backgroundColor: '#f9fafb',
                          marginLeft: '0.25rem',
                          display: 'inline-block',
                        }}
                      >
                        Import Excel
                      </span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            handleImportFloorsFromExcel(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="data-grid">
                    <table>
                    <thead>
                      <tr>
                        <th>Building</th>
                        <th>Floor</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                      <tr>
                        <th>
                          <input
                            placeholder="Filter"
                            list="floor-building-options"
                            value={floorFilter.building}
                            onChange={(e) =>
                              setFloorFilter({ ...floorFilter, building: e.target.value })
                            }
                          />
                          <datalist id="floor-building-options">
                            {Array.from(new Set(floors.map((f) => f.BuildingName || f.BuildingID || ''))) 
                              .filter((v) => v)
                              .map((b) => (
                                <option key={b} value={b} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="floor-number-options"
                            value={floorFilter.floorNumber}
                            onChange={(e) =>
                              setFloorFilter({
                                ...floorFilter,
                                floorNumber: e.target.value,
                              })
                            }
                          />
                          <datalist id="floor-number-options">
                            {Array.from(new Set(floors.map((f) => String(f.FloorNumber ?? '') ))) 
                              .filter((v) => v)
                              .map((n) => (
                                <option key={n} value={n} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="floor-desc-options"
                            value={floorFilter.description}
                            onChange={(e) =>
                              setFloorFilter({
                                ...floorFilter,
                                description: e.target.value,
                              })
                            }
                          />
                          <datalist id="floor-desc-options">
                            {Array.from(new Set(floors.map((f) => f.Description || ''))) 
                              .filter((v) => v)
                              .map((d) => (
                                <option key={d} value={d} />
                              ))}
                          </datalist>
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFloors.map((f) => (
                        <tr key={f.FloorID}>
                          <td>{f.BuildingName || f.BuildingID}</td>
                          <td>{f.FloorNumber}</td>
                          <td>{f.Description}</td>
                          <td>
                            <span className="row-actions">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => startEditFloor(f)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="icon-btn danger"
                                onClick={() => handleDeleteFloor(f.FloorID)}
                              >
                                Del
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>

            {structureMessage && (
              <p className="muted">{structureMessage}</p>
            )}
          </>
        )}

        {activeMenu === 'flats' && (
          <>
            <div className="section">
              <h2>{editingFlatId ? 'Edit Flat' : 'Create Flat'}</h2>
              <form onSubmit={handleCreateFlat} className="form-grid">
                <div className="form-field">
                  <label>Floor*</label>
                  <select
                    value={flatForm.floorId}
                    onChange={(e) => setFlatForm({ ...flatForm, floorId: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    {floors.map((f) => (
                      <option key={f.FloorID} value={f.FloorID}>
                        {f.BuildingName || 'B'} - Floor {f.FloorNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Flat Number*</label>
                  <input
                    value={flatForm.flatNumber}
                    onChange={(e) => setFlatForm({ ...flatForm, flatNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Flat Type</label>
                  <input
                    value={flatForm.flatType}
                    onChange={(e) => setFlatForm({ ...flatForm, flatType: e.target.value })}
                  />
                </div>
                <button type="submit" className="primary-btn">
                  {editingFlatId ? 'Update Flat' : 'Save Flat'}
                </button>
                {editingFlatId && (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginLeft: '0.5rem', backgroundColor: '#6b7280' }}
                    onClick={() => {
                      setEditingFlatId(null);
                      setFlatForm({ floorId: '', flatNumber: '', flatType: '' });
                      setStructureMessage('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="section">
              <h2>Flats</h2>
              {flats.length === 0 ? (
                <p className="muted">No flats yet.</p>
              ) : (
                <>
                  <div
                    style={{
                      marginBottom: '0.5rem',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Type', 'Status'];
                        const rows = filteredFlats.map((fl) => [
                          fl.BuildingName || '',
                          fl.FloorNumber ?? '',
                          fl.FlatNumber || '',
                          fl.FlatType || '',
                          fl.Status || '',
                        ]);
                        exportTableToCSV(headers, rows, 'flats.csv');
                      }}
                      style={{ marginRight: '0.25rem' }}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Type', 'Status'];
                        const rows = filteredFlats.map((fl) => [
                          fl.BuildingName || '',
                          fl.FloorNumber ?? '',
                          fl.FlatNumber || '',
                          fl.FlatType || '',
                          fl.Status || '',
                        ]);
                        exportTableToExcel(headers, rows, 'flats.xlsx');
                      }}
                      style={{ marginRight: '0.25rem', backgroundColor: '#4b5563' }}
                    >
                      Export Excel
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Type', 'Status'];
                        const rows = filteredFlats.map((fl) => [
                          fl.BuildingName || '',
                          fl.FloorNumber ?? '',
                          fl.FlatNumber || '',
                          fl.FlatType || '',
                          fl.Status || '',
                        ]);
                        exportTableToPDF(headers, rows, 'Flats', 'flats.pdf');
                      }}
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      Export PDF
                    </button>
                    <label
                      style={{ fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.375rem',
                          border: '1px dashed #9ca3af',
                          backgroundColor: '#f9fafb',
                          marginLeft: '0.25rem',
                          display: 'inline-block',
                        }}
                      >
                        Import Excel
                      </span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            handleImportFlatsFromExcel(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="data-grid">
                    <table>
                      <thead>
                        <tr>
                          <th>Building</th>
                          <th>Floor</th>
                          <th>Flat</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                        <tr>
                          <th>
                            <input
                              placeholder="Filter"
                              list="flat-building-options"
                              value={flatFilter.building || ''}
                              onChange={(e) =>
                                setFlatFilter({ ...flatFilter, building: e.target.value })
                              }
                            />
                            <datalist id="flat-building-options">
                              {Array.from(new Set(flats.map((fl) => fl.BuildingName || ''))) 
                                .filter((v) => v)
                                .map((b) => (
                                  <option key={b} value={b} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="flat-floor-options"
                              value={flatFilter.floorNumber || ''}
                              onChange={(e) =>
                                setFlatFilter({ ...flatFilter, floorNumber: e.target.value })
                              }
                            />
                            <datalist id="flat-floor-options">
                              {Array.from(new Set(flats.map((fl) => String(fl.FloorNumber ?? '') ))) 
                                .filter((v) => v)
                                .map((f) => (
                                  <option key={f} value={f} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="flat-number-options"
                              value={flatFilter.flatNumber}
                              onChange={(e) =>
                                setFlatFilter({ ...flatFilter, flatNumber: e.target.value })
                              }
                            />
                            <datalist id="flat-number-options">
                              {Array.from(new Set(flats.map((fl) => fl.FlatNumber || ''))) 
                                .filter((v) => v)
                                .map((n) => (
                                  <option key={n} value={n} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="flat-type-options"
                              value={flatFilter.flatType}
                              onChange={(e) =>
                                setFlatFilter({ ...flatFilter, flatType: e.target.value })
                              }
                            />
                            <datalist id="flat-type-options">
                              {Array.from(new Set(flats.map((fl) => fl.FlatType || ''))) 
                                .filter((v) => v)
                                .map((t) => (
                                  <option key={t} value={t} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="flat-status-options"
                              value={flatFilter.status}
                              onChange={(e) =>
                                setFlatFilter({ ...flatFilter, status: e.target.value })
                              }
                            />
                            <datalist id="flat-status-options">
                              {Array.from(new Set(flats.map((fl) => fl.Status || ''))) 
                                .filter((v) => v)
                                .map((s) => (
                                  <option key={s} value={s} />
                                ))}
                            </datalist>
                          </th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFlats.map((fl) => (
                          <tr key={fl.FlatID}>
                            <td>{fl.BuildingName || ''}</td>
                            <td>{fl.FloorNumber ?? ''}</td>
                            <td>{fl.FlatNumber}</td>
                            <td>{fl.FlatType}</td>
                            <td>{fl.Status}</td>
                            <td>
                              <span className="row-actions">
                                <button
                                  type="button"
                                  className="icon-btn"
                                  onClick={() => startEditFlat(fl)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="icon-btn danger"
                                  onClick={() => handleDeleteFlat(fl.FlatID)}
                                >
                                  Del
                                </button>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                </>
              )}
            </div>

            {structureMessage && (
              <p className="muted">{structureMessage}</p>
            )}
          </>
        )}

        {activeMenu === 'rooms' && (
          <>
            <div className="section">
              <h2>{editingRoomId ? 'Edit Room' : 'Create Room'}</h2>
              <form onSubmit={handleCreateRoom} className="form-grid">
                <div className="form-field">
                  <label>Flat*</label>
                  <select
                    value={roomForm.flatId}
                    onChange={(e) => setRoomForm({ ...roomForm, flatId: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    {flats.map((fl) => (
                      <option key={fl.FlatID} value={fl.FlatID}>
                        {(fl.BuildingName || '')} - Floor: {(fl.FloorNumber ?? '')} - Flat: {fl.FlatNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Room Number*</label>
                  <input
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Room Type</label>
                  <input
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Max Occupancy*</label>
                  <input
                    type="number"
                    value={roomForm.maxOccupancy}
                    onChange={(e) => setRoomForm({ ...roomForm, maxOccupancy: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Gender Restriction</label>
                  <select
                    value={roomForm.genderRestriction}
                    onChange={(e) => setRoomForm({ ...roomForm, genderRestriction: e.target.value })}
                  >
                    <option value="">None</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <button type="submit" className="primary-btn">
                  {editingRoomId ? 'Update Room' : 'Save Room'}
                </button>
                {editingRoomId && (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginLeft: '0.5rem', backgroundColor: '#6b7280' }}
                    onClick={() => {
                      setEditingRoomId(null);
                      setRoomForm({ flatId: '', roomNumber: '', roomType: '', maxOccupancy: 1, genderRestriction: '' });
                      setStructureMessage('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="section">
              <h2>Rooms</h2>
              {rooms.length === 0 ? (
                <p className="muted">No rooms yet.</p>
              ) : (
                <>
                  <div
                    style={{
                      marginBottom: '0.5rem',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Room', 'Type', 'Max Occupancy', 'Gender Restriction', 'Status'];
                        const rows = filteredRooms.map((r) => [
                          r.BuildingName || '',
                          r.FloorNumber ?? '',
                          r.FlatNumber || '',
                          r.RoomNumber || '',
                          r.RoomType || '',
                          r.MaxOccupancy ?? '',
                          r.GenderRestriction || '',
                          r.Status || '',
                        ]);
                        exportTableToCSV(headers, rows, 'rooms.csv');
                      }}
                      style={{ marginRight: '0.25rem' }}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Room', 'Type', 'Max Occupancy', 'Gender Restriction', 'Status'];
                        const rows = filteredRooms.map((r) => [
                          r.BuildingName || '',
                          r.FloorNumber ?? '',
                          r.FlatNumber || '',
                          r.RoomNumber || '',
                          r.RoomType || '',
                          r.MaxOccupancy ?? '',
                          r.GenderRestriction || '',
                          r.Status || '',
                        ]);
                        exportTableToExcel(headers, rows, 'rooms.xlsx');
                      }}
                      style={{ marginRight: '0.25rem', backgroundColor: '#4b5563' }}
                    >
                      Export Excel
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Room', 'Type', 'Max Occupancy', 'Gender Restriction', 'Status'];
                        const rows = filteredRooms.map((r) => [
                          r.BuildingName || '',
                          r.FloorNumber ?? '',
                          r.FlatNumber || '',
                          r.RoomNumber || '',
                          r.RoomType || '',
                          r.MaxOccupancy ?? '',
                          r.GenderRestriction || '',
                          r.Status || '',
                        ]);
                        exportTableToPDF(headers, rows, 'Rooms', 'rooms.pdf');
                      }}
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      Export PDF
                    </button>
                    <label
                      style={{ fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.375rem',
                          border: '1px dashed #9ca3af',
                          backgroundColor: '#f9fafb',
                          marginLeft: '0.25rem',
                          display: 'inline-block',
                        }}
                      >
                        Import Excel
                      </span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            handleImportRoomsFromExcel(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="data-grid">
                    <table>
                    <thead>
                      <tr>
                        <th>Building</th>
                        <th>Floor</th>
                        <th>Flat</th>
                        <th>Room</th>
                        <th>Type</th>
                        <th>Max Occupancy</th>
                        <th>Gender Restriction</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                      <tr>
                        <th>
                          <input
                            placeholder="Filter"
                            list="room-building-options"
                            value={roomFilter.building}
                            onChange={(e) =>
                              setRoomFilter({ ...roomFilter, building: e.target.value })
                            }
                          />
                          <datalist id="room-building-options">
                            {Array.from(new Set(rooms.map((r) => r.BuildingName || ''))) 
                              .filter((v) => v)
                              .map((b) => (
                                <option key={b} value={b} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="room-floor-options"
                            value={roomFilter.floorNumber}
                            onChange={(e) =>
                              setRoomFilter({ ...roomFilter, floorNumber: e.target.value })
                            }
                          />
                          <datalist id="room-floor-options">
                            {Array.from(new Set(rooms.map((r) => String(r.FloorNumber ?? '') ))) 
                              .filter((v) => v)
                              .map((f) => (
                                <option key={f} value={f} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="room-flat-options"
                            value={roomFilter.flatNumber}
                            onChange={(e) =>
                              setRoomFilter({ ...roomFilter, flatNumber: e.target.value })
                            }
                          />
                          <datalist id="room-flat-options">
                            {Array.from(new Set(rooms.map((r) => r.FlatNumber || ''))) 
                              .filter((v) => v)
                              .map((fl) => (
                                <option key={fl} value={fl} />
                              ))}
                          </datalist>
                        </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="room-number-options"
                              value={roomFilter.roomNumber}
                              onChange={(e) =>
                                setRoomFilter({ ...roomFilter, roomNumber: e.target.value })
                              }
                            />
                            <datalist id="room-number-options">
                              {Array.from(new Set(rooms.map((r) => r.RoomNumber || ''))) 
                                .filter((v) => v)
                                .map((rn) => (
                                  <option key={rn} value={rn} />
                                ))}
                            </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="room-type-options"
                            value={roomFilter.roomType}
                            onChange={(e) =>
                              setRoomFilter({ ...roomFilter, roomType: e.target.value })
                            }
                          />
                          <datalist id="room-type-options">
                            {Array.from(new Set(rooms.map((r) => r.RoomType || ''))) 
                              .filter((v) => v)
                              .map((t) => (
                                <option key={t} value={t} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="room-max-options"
                            value={roomFilter.maxOccupancy}
                            onChange={(e) =>
                              setRoomFilter({
                                ...roomFilter,
                                maxOccupancy: e.target.value,
                              })
                            }
                          />
                          <datalist id="room-max-options">
                            {Array.from(new Set(rooms.map((r) => String(r.MaxOccupancy ?? '') ))) 
                              .filter((v) => v)
                              .map((m) => (
                                <option key={m} value={m} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="room-gender-options"
                            value={roomFilter.genderRestriction}
                            onChange={(e) =>
                              setRoomFilter({
                                ...roomFilter,
                                genderRestriction: e.target.value,
                              })
                            }
                          />
                          <datalist id="room-gender-options">
                            {Array.from(new Set(rooms.map((r) => r.GenderRestriction || ''))) 
                              .filter((v) => v)
                              .map((g) => (
                                <option key={g} value={g} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="room-status-options"
                            value={roomFilter.status}
                            onChange={(e) =>
                              setRoomFilter({ ...roomFilter, status: e.target.value })
                            }
                          />
                          <datalist id="room-status-options">
                            {Array.from(new Set(rooms.map((r) => r.Status || ''))) 
                              .filter((v) => v)
                              .map((s) => (
                                <option key={s} value={s} />
                              ))}
                          </datalist>
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRooms.map((r) => (
                        <tr key={r.RoomID}>
                          <td>{r.BuildingName}</td>
                          <td>{r.FloorNumber}</td>
                          <td>{r.FlatNumber}</td>
                          <td>{r.RoomNumber}</td>
                          <td>{r.RoomType}</td>
                          <td>{r.MaxOccupancy}</td>
                          <td>{r.GenderRestriction}</td>
                          <td>{r.Status}</td>
                          <td>
                            <span className="row-actions">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => startEditRoom(r)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="icon-btn danger"
                                onClick={() => handleDeleteRoom(r.RoomID)}
                              >
                                Del
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>

            {structureMessage && (
              <p className="muted">{structureMessage}</p>
            )}
          </>
        )}

        {activeMenu === 'beds' && (
          <>
            <div className="section">
              <h2>{editingBedId ? 'Edit Bed' : 'Create Bed'}</h2>
              <form onSubmit={handleCreateBed} className="form-grid">
                <div className="form-field">
                  <label>Room*</label>
                  <select
                    value={bedForm.roomId}
                    onChange={(e) => setBedForm({ ...bedForm, roomId: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    {rooms.map((r) => (
                      <option key={r.RoomID} value={r.RoomID}>
                        {(r.BuildingName || '')} - Floor: {(r.FloorNumber ?? '')} - Flat: {(r.FlatNumber || '')} - Room: {r.RoomNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Bed Code*</label>
                  <input
                    value={bedForm.bedCode}
                    onChange={(e) => setBedForm({ ...bedForm, bedCode: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="primary-btn">
                  {editingBedId ? 'Update Bed' : 'Save Bed'}
                </button>
                {editingBedId && (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginLeft: '0.5rem', backgroundColor: '#6b7280' }}
                    onClick={() => {
                      setEditingBedId(null);
                      setBedForm({ roomId: '', bedCode: '' });
                      setStructureMessage('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="section">
              <h2>Beds</h2>
              {beds.length === 0 ? (
                <p className="muted">No beds yet.</p>
              ) : (
                <>
                  <div
                    style={{
                      marginBottom: '0.5rem',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Room', 'Bed', 'Status'];
                        const rows = filteredBeds.map((bd) => [
                          bd.BuildingName || '',
                          bd.FloorNumber ?? '',
                          bd.FlatNumber || '',
                          bd.RoomNumber || '',
                          bd.BedCode || '',
                          bd.Status || '',
                        ]);
                        exportTableToCSV(headers, rows, 'beds.csv');
                      }}
                      style={{ marginRight: '0.25rem' }}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Room', 'Bed', 'Status'];
                        const rows = filteredBeds.map((bd) => [
                          bd.BuildingName || '',
                          bd.FloorNumber ?? '',
                          bd.FlatNumber || '',
                          bd.RoomNumber || '',
                          bd.BedCode || '',
                          bd.Status || '',
                        ]);
                        exportTableToExcel(headers, rows, 'beds.xlsx');
                      }}
                      style={{ marginRight: '0.25rem', backgroundColor: '#4b5563' }}
                    >
                      Export Excel
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Building', 'Floor', 'Flat', 'Room', 'Bed', 'Status'];
                        const rows = filteredBeds.map((bd) => [
                          bd.BuildingName || '',
                          bd.FloorNumber ?? '',
                          bd.FlatNumber || '',
                          bd.RoomNumber || '',
                          bd.BedCode || '',
                          bd.Status || '',
                        ]);
                        exportTableToPDF(headers, rows, 'Beds', 'beds.pdf');
                      }}
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      Export PDF
                    </button>
                    <label
                      style={{ fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.375rem',
                          border: '1px dashed #9ca3af',
                          backgroundColor: '#f9fafb',
                          marginLeft: '0.25rem',
                          display: 'inline-block',
                        }}
                      >
                        Import Excel
                      </span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            handleImportBedsFromExcel(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="data-grid">
                    <table>
                      <thead>
                        <tr>
                          <th>Building</th>
                          <th>Floor</th>
                          <th>Flat</th>
                          <th>Room</th>
                          <th>Bed</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                        <tr>
                          <th>
                            <input
                              placeholder="Filter"
                              list="bed-building-options"
                              value={bedFilter.building}
                              onChange={(e) =>
                                setBedFilter({ ...bedFilter, building: e.target.value })
                              }
                            />
                            <datalist id="bed-building-options">
                              {Array.from(new Set(beds.map((bd) => bd.BuildingName || ''))) 
                                .filter((v) => v)
                                .map((b) => (
                                  <option key={b} value={b} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="bed-floor-options"
                              value={bedFilter.floorNumber}
                              onChange={(e) =>
                                setBedFilter({ ...bedFilter, floorNumber: e.target.value })
                              }
                            />
                            <datalist id="bed-floor-options">
                              {Array.from(new Set(beds.map((bd) => String(bd.FloorNumber ?? '') ))) 
                                .filter((v) => v)
                                .map((f) => (
                                  <option key={f} value={f} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="bed-flat-options"
                              value={bedFilter.flatNumber}
                              onChange={(e) =>
                                setBedFilter({ ...bedFilter, flatNumber: e.target.value })
                              }
                            />
                            <datalist id="bed-flat-options">
                              {Array.from(new Set(beds.map((bd) => bd.FlatNumber || ''))) 
                                .filter((v) => v)
                                .map((fl) => (
                                  <option key={fl} value={fl} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="bed-room-options"
                              value={bedFilter.roomNumber}
                              onChange={(e) =>
                                setBedFilter({ ...bedFilter, roomNumber: e.target.value })
                              }
                            />
                            <datalist id="bed-room-options">
                              {Array.from(new Set(beds.map((bd) => bd.RoomNumber || ''))) 
                                .filter((v) => v)
                                .map((r) => (
                                  <option key={r} value={r} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="bed-code-options"
                              value={bedFilter.bedCode}
                              onChange={(e) =>
                                setBedFilter({ ...bedFilter, bedCode: e.target.value })
                              }
                            />
                            <datalist id="bed-code-options">
                              {Array.from(new Set(beds.map((bd) => bd.BedCode || ''))) 
                                .filter((v) => v)
                                .map((c) => (
                                  <option key={c} value={c} />
                                ))}
                            </datalist>
                          </th>
                          <th>
                            <input
                              placeholder="Filter"
                              list="bed-status-options"
                              value={bedFilter.status}
                              onChange={(e) =>
                                setBedFilter({ ...bedFilter, status: e.target.value })
                              }
                            />
                            <datalist id="bed-status-options">
                              {Array.from(new Set(beds.map((bd) => bd.Status || ''))) 
                                .filter((v) => v)
                                .map((s) => (
                                  <option key={s} value={s} />
                                ))}
                            </datalist>
                          </th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBeds.map((bd) => (
                          <tr key={bd.BedID}>
                            <td>{bd.BuildingName}</td>
                            <td>{bd.FloorNumber}</td>
                            <td>{bd.FlatNumber}</td>
                            <td>{bd.RoomNumber}</td>
                            <td>{bd.BedCode}</td>
                            <td>{bd.Status}</td>
                            <td>
                              <span className="row-actions">
                                <button
                                  type="button"
                                  className="icon-btn"
                                  onClick={() => startEditBed(bd)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="icon-btn danger"
                                  onClick={() => handleDeleteBed(bd.BedID)}
                                >
                                  Del
                                </button>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bed-map">
                    <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Seat-style View</h3>
                    <div className="bed-map-grid">
                      {beds.map((bd) => (
                        <div
                          key={`seat-${bd.BedID}`}
                          className={`bed-seat ${bd.Status === 'Occupied' ? 'occupied' : 'available'}`}
                          title={`Bed ${bd.BedCode} - ${bd.Status}`}
                        >
                          {bd.BedCode}
                        </div>
                      ))}
                    </div>
                    <div className="bed-map-legend">
                      <div className="bed-map-legend-item">
                        <span className="bed-map-legend-swatch" style={{ backgroundColor: '#dcfce7' }} />
                        Available
                      </div>
                      <div className="bed-map-legend-item">
                        <span className="bed-map-legend-swatch" style={{ backgroundColor: '#fee2e2' }} />
                        Occupied
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {structureMessage && (
              <p className="muted">{structureMessage}</p>
            )}
          </>
        )}

        {activeMenu === 'bedStatus' && (
          <>
            <div className="section">
              <h2>Bed Status</h2>
              <div className="form-grid">
                <div className="form-field">
                  <label>Area</label>
                  <select
                    value={bedStatusFilter.location}
                    onChange={(e) =>
                      setBedStatusFilter({
                        location: e.target.value,
                        buildingId: '',
                        floorId: '',
                        flatId: '',
                        roomId: '',
                      })
                    }
                  >
                    <option value="">Select area</option>
                    {Array.from(
                      new Set(
                        buildings
                          .map((b) => (b.Location || '').trim())
                          .filter((loc) => loc)
                      )
                    ).map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Building</label>
                  <select
                    value={bedStatusFilter.buildingId}
                    onChange={(e) =>
                      setBedStatusFilter({
                        buildingId: e.target.value,
                        floorId: '',
                        flatId: '',
                        roomId: '',
                      })
                    }
                  >
                    <option value="">Select building</option>
                    {buildings
                      .filter(
                        (b) =>
                          !bedStatusFilter.location ||
                          (b.Location || '').trim() === bedStatusFilter.location
                      )
                      .map((b) => (
                        <option key={b.BuildingID} value={b.BuildingID}>
                          {b.BuildingName}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Floor</label>
                  <select
                    value={bedStatusFilter.floorId}
                    onChange={(e) =>
                      setBedStatusFilter((prev) => ({
                        ...prev,
                        floorId: e.target.value,
                        flatId: '',
                        roomId: '',
                      }))
                    }
                    disabled={!bedStatusFilter.buildingId}
                  >
                    <option value="">Select floor</option>
                    {floors
                      .filter(
                        (f) =>
                          !bedStatusFilter.buildingId ||
                          f.BuildingID === Number(bedStatusFilter.buildingId)
                      )
                      .map((f) => (
                        <option key={f.FloorID} value={f.FloorID}>
                          Floor {f.FloorNumber}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Flat</label>
                  <select
                    value={bedStatusFilter.flatId}
                    onChange={(e) =>
                      setBedStatusFilter((prev) => ({
                        ...prev,
                        flatId: e.target.value,
                        roomId: '',
                      }))
                    }
                    disabled={!bedStatusFilter.floorId}
                  >
                    <option value="">Select flat</option>
                    {flats
                      .filter(
                        (fl) =>
                          !bedStatusFilter.floorId ||
                          fl.FloorID === Number(bedStatusFilter.floorId)
                      )
                      .map((fl) => (
                        <option key={fl.FlatID} value={fl.FlatID}>
                          Flat {fl.FlatNumber}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Room</label>
                  <select
                    value={bedStatusFilter.roomId}
                    onChange={(e) =>
                      setBedStatusFilter((prev) => ({
                        ...prev,
                        roomId: e.target.value,
                      }))
                    }
                    disabled={!bedStatusFilter.flatId}
                  >
                    <option value="">Select room</option>
                    {rooms
                      .filter(
                        (r) =>
                          !bedStatusFilter.flatId ||
                          r.FlatID === Number(bedStatusFilter.flatId)
                      )
                      .map((r) => (
                        <option key={r.RoomID} value={r.RoomID}>
                          Room {r.RoomNumber}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="section">
              <h2>Seat-style Bed View</h2>
              {(() => {
                if (beds.length === 0) {
                  return <p className="muted">No beds defined.</p>;
                }

                const filteredBeds = beds.filter((b) => {
                  const room = rooms.find((r) => r.RoomID === b.RoomID);
                  if (!room) return false;
                  const flat = flats.find((fl) => fl.FlatID === room.FlatID);
                  if (!flat) return false;
                  const floor = floors.find((f) => f.FloorID === flat.FloorID);
                  if (!floor) return false;
                  const building = buildings.find((bld) => bld.BuildingID === floor.BuildingID);

                  if (
                    bedStatusFilter.location &&
                    (!building || (building.Location || '').trim() !== bedStatusFilter.location)
                  ) {
                    return false;
                  }

                  if (
                    bedStatusFilter.buildingId &&
                    floor.BuildingID !== Number(bedStatusFilter.buildingId)
                  ) {
                    return false;
                  }
                  if (
                    bedStatusFilter.floorId &&
                    floor.FloorID !== Number(bedStatusFilter.floorId)
                  ) {
                    return false;
                  }
                  if (
                    bedStatusFilter.flatId &&
                    flat.FlatID !== Number(bedStatusFilter.flatId)
                  ) {
                    return false;
                  }
                  if (
                    bedStatusFilter.roomId &&
                    room.RoomID !== Number(bedStatusFilter.roomId)
                  ) {
                    return false;
                  }

                  return true;
                });

                if (filteredBeds.length === 0) {
                  return <p className="muted">No beds match current filters.</p>;
                }

                const groupedByLocation = filteredBeds.reduce((acc, bd) => {
                  const room = rooms.find((r) => r.RoomID === bd.RoomID);
                  const flat = room ? flats.find((fl) => fl.FlatID === room.FlatID) : null;
                  const floor = flat ? floors.find((f) => f.FloorID === flat.FloorID) : null;
                  if (!floor || !room) return acc;
                  const building = buildings.find((b) => b.BuildingID === floor.BuildingID);

                  const locationKey = (building?.Location || 'Unspecified').trim() || 'Unspecified';
                  if (!acc[locationKey]) {
                    acc[locationKey] = { locationLabel: locationKey, buildings: {} };
                  }

                  const buildingKey = floor.BuildingID || 'building-unknown';
                  if (!acc[locationKey].buildings[buildingKey]) {
                    acc[locationKey].buildings[buildingKey] = {
                      buildingName: building?.BuildingName || `Building ${buildingKey}`,
                      floors: {},
                    };
                  }

                  const floorKey = floor.FloorID || 'floor-unknown';
                  if (!acc[locationKey].buildings[buildingKey].floors[floorKey]) {
                    acc[locationKey].buildings[buildingKey].floors[floorKey] = {
                      floorLabel: `Floor ${floor.FloorNumber ?? ''}`.trim(),
                      rooms: {},
                    };
                  }

                  const roomKey = room.RoomID || 'room-unknown';
                  if (!acc[locationKey].buildings[buildingKey].floors[floorKey].rooms[roomKey]) {
                    acc[locationKey].buildings[buildingKey].floors[floorKey].rooms[roomKey] = {
                      roomLabel: `Room ${room.RoomNumber ?? ''}`.trim(),
                      beds: [],
                    };
                  }

                  acc[locationKey].buildings[buildingKey].floors[floorKey].rooms[roomKey].beds.push(bd);
                  return acc;
                }, {});

                return (
                  <>
                    {Object.values(groupedByLocation).map((locationGroup) => (
                      <div key={locationGroup.locationLabel} style={{ marginBottom: '1.25rem' }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            fontSize: '0.95rem',
                          }}
                        >
                          Area: {locationGroup.locationLabel}
                        </div>
                        {Object.values(locationGroup.buildings).map((buildingGroup) => (
                          <div
                            key={buildingGroup.buildingName}
                            className="bed-status-building-card"
                          >
                            <div className="bed-status-building-title">
                              {buildingGroup.buildingName}
                            </div>
                            {Object.values(buildingGroup.floors).map((floorGroup) => (
                              <div
                                key={`${buildingGroup.buildingName}-${floorGroup.floorLabel}`}
                                className="bed-status-floor-block"
                              >
                                <div className="bed-status-floor-title">
                                  {floorGroup.floorLabel || 'Floor'}
                                </div>
                                {Object.values(floorGroup.rooms).map((roomGroup) => (
                                  <div
                                    key={`${buildingGroup.buildingName}-${floorGroup.floorLabel}-${roomGroup.roomLabel}`}
                                    className="bed-status-room-block"
                                  >
                                    <div className="bed-status-room-title">
                                      {roomGroup.roomLabel || 'Room'}
                                    </div>
                                    <div className="bed-map-grid">
                                      {roomGroup.beds.map((bd) => (
                                        <div
                                          key={`status-seat-${bd.BedID}`}
                                          className={`bed-seat ${
                                            bd.Status === 'Occupied' ? 'occupied' : 'available'
                                          }`}
                                          title={`Bed ${bd.BedCode} - ${bd.Status}`}
                                        >
                                          {bd.BedCode}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="bed-map-legend">
                      <div className="bed-map-legend-item">
                        <span
                          className="bed-map-legend-swatch"
                          style={{ backgroundColor: '#dcfce7' }}
                        />
                        Available
                      </div>
                      <div className="bed-map-legend-item">
                        <span
                          className="bed-map-legend-swatch"
                          style={{ backgroundColor: '#fee2e2' }}
                        />
                        Occupied
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </>
        )}

        {activeMenu === 'employees' && (
          <>
            <div className="section">
              <h2>{editingEmployeeId ? 'Edit Employee' : 'Create Employee'}</h2>
              <form onSubmit={handleCreateEmployee}>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Employee Code*</label>
                    <input
                      value={empForm.employeeCode}
                      onChange={(e) => setEmpForm({ ...empForm, employeeCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>First Name*</label>
                    <input
                      value={empForm.firstName}
                      onChange={(e) => setEmpForm({ ...empForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Last Name*</label>
                    <input
                      value={empForm.lastName}
                      onChange={(e) => setEmpForm({ ...empForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Department</label>
                    <input
                      value={empForm.department}
                      onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Grade</label>
                    <input
                      value={empForm.grade}
                      onChange={(e) => setEmpForm({ ...empForm, grade: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Gender*</label>
                    <select
                      value={empForm.gender}
                      onChange={(e) => setEmpForm({ ...empForm, gender: e.target.value })}
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="primary-btn">
                  {editingEmployeeId ? 'Update Employee' : 'Save Employee'}
                </button>
                {editingEmployeeId && (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginLeft: '0.5rem', backgroundColor: '#6b7280' }}
                    onClick={() => {
                      setEditingEmployeeId(null);
                      setEmpForm({
                        employeeCode: '',
                        firstName: '',
                        lastName: '',
                        department: '',
                        grade: '',
                        gender: 'M',
                      });
                      setEmpMessage('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
              {empMessage && <p className="muted">{empMessage}</p>}
            </div>

            <div className="section">
              <h2>Employees</h2>
              {employees.length === 0 ? (
                <p className="muted">No employees yet.</p>
              ) : (
                <>
                  <div
                    style={{
                      marginBottom: '0.5rem',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Code', 'Name', 'LastName', 'Department', 'Grade', 'Gender'];
                        const rows = filteredEmployees.map((e) => [
                          e.EmployeeCode || '',
                          `${e.FirstName || ''} ${e.LastName || ''}`.trim(),
                          e.LastName || '',
                          e.Department || '',
                          e.Grade || '',
                          e.Gender || '',
                        ]);
                        exportTableToCSV(headers, rows, 'employees.csv');
                      }}
                      style={{ marginRight: '0.25rem' }}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Code', 'Name', 'LastName', 'Department', 'Grade', 'Gender'];
                        const rows = filteredEmployees.map((e) => [
                          e.EmployeeCode || '',
                          `${e.FirstName || ''} ${e.LastName || ''}`.trim(),
                          e.LastName || '',
                          e.Department || '',
                          e.Grade || '',
                          e.Gender || '',
                        ]);
                        exportTableToExcel(headers, rows, 'employees.xlsx');
                      }}
                      style={{ marginRight: '0.25rem', backgroundColor: '#4b5563' }}
                    >
                      Export Excel
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = ['Code', 'Name', 'LastName', 'Department', 'Grade', 'Gender'];
                        const rows = filteredEmployees.map((e) => [
                          e.EmployeeCode || '',
                          `${e.FirstName || ''} ${e.LastName || ''}`.trim(),
                          e.LastName || '',
                          e.Department || '',
                          e.Grade || '',
                          e.Gender || '',
                        ]);
                        exportTableToPDF(headers, rows, 'Employees', 'employees.pdf');
                      }}
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      Export PDF
                    </button>
                    <label
                      style={{ fontSize: '0.8rem', color: '#4b5563', cursor: 'pointer' }}
                    >
                      <span
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.375rem',
                          border: '1px dashed #9ca3af',
                          backgroundColor: '#f9fafb',
                          marginLeft: '0.25rem',
                          display: 'inline-block',
                        }}
                      >
                        Import Excel
                      </span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            handleImportEmployeesFromExcel(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="data-grid">
                    <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Grade</th>
                        <th>Gender</th>
                        <th>Actions</th>
                      </tr>
                      <tr>
                        <th>
                          <input
                            placeholder="Filter"
                            list="emp-code-options"
                            value={employeeFilter.code}
                            onChange={(e) =>
                              setEmployeeFilter({ ...employeeFilter, code: e.target.value })
                            }
                          />
                          <datalist id="emp-code-options">
                            {Array.from(new Set(employees.map((e) => e.EmployeeCode || ''))) 
                              .filter((v) => v)
                              .map((c) => (
                                <option key={c} value={c} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="emp-name-options"
                            value={employeeFilter.name}
                            onChange={(e) =>
                              setEmployeeFilter({ ...employeeFilter, name: e.target.value })
                            }
                          />
                          <datalist id="emp-name-options">
                            {Array.from(
                              new Set(
                                employees.map(
                                  (e) => `${e.FirstName || ''} ${e.LastName || ''}`.trim() || ''
                                )
                              )
                            )
                              .filter((v) => v)
                              .map((n) => (
                                <option key={n} value={n} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="emp-dept-options"
                            value={employeeFilter.department}
                            onChange={(e) =>
                              setEmployeeFilter({
                                ...employeeFilter,
                                department: e.target.value,
                              })
                            }
                          />
                          <datalist id="emp-dept-options">
                            {Array.from(new Set(employees.map((e) => e.Department || ''))) 
                              .filter((v) => v)
                              .map((d) => (
                                <option key={d} value={d} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="emp-grade-options"
                            value={employeeFilter.grade}
                            onChange={(e) =>
                              setEmployeeFilter({ ...employeeFilter, grade: e.target.value })
                            }
                          />
                          <datalist id="emp-grade-options">
                            {Array.from(new Set(employees.map((e) => e.Grade || ''))) 
                              .filter((v) => v)
                              .map((g) => (
                                <option key={g} value={g} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="emp-gender-options"
                            value={employeeFilter.gender}
                            onChange={(e) =>
                              setEmployeeFilter({ ...employeeFilter, gender: e.target.value })
                            }
                          />
                          <datalist id="emp-gender-options">
                            {Array.from(new Set(employees.map((e) => e.Gender || ''))) 
                              .filter((v) => v)
                              .map((g) => (
                                <option key={g} value={g} />
                              ))}
                          </datalist>
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((e) => (
                        <tr key={e.EmployeeID}>
                          <td>{e.EmployeeCode}</td>
                          <td>
                            {e.FirstName} {e.LastName}
                          </td>
                          <td>{e.Department}</td>
                          <td>{e.Grade}</td>
                          <td>{e.Gender}</td>
                          <td>
                            <span className="row-actions">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => startEditEmployee(e)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="icon-btn danger"
                                onClick={() => handleDeleteEmployee(e.EmployeeID)}
                              >
                                Del
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          </>
        )}

        {activeMenu === 'assignments' && (
          <>
            <div className="section">
              <h2>Create Bed Assignment</h2>
              <form onSubmit={handleCreateAssignment} className="form-grid">
                <div className="form-field">
                  <label>Employee*</label>
                  <select
                    value={assignmentForm.employeeId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, employeeId: e.target.value })}
                    required
                    disabled={!!editingAssignmentId}
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.EmployeeID} value={emp.EmployeeID}>
                        {emp.EmployeeCode} - {emp.FirstName} {emp.LastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Building*</label>
                  <select
                    value={assignmentForm.buildingId}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        buildingId: e.target.value,
                        floorId: '',
                        flatId: '',
                        roomId: '',
                        bedId: '',
                      })
                    }
                    required
                    disabled={!!editingAssignmentId}
                  >
                    <option value="">Select building</option>
                    {buildings.map((b) => (
                      <option key={b.BuildingID} value={b.BuildingID}>
                        {b.BuildingName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Floor*</label>
                  <select
                    value={assignmentForm.floorId}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        floorId: e.target.value,
                        flatId: '',
                        roomId: '',
                        bedId: '',
                      })
                    }
                    required
                    disabled={!assignmentForm.buildingId || !!editingAssignmentId}
                  >
                    <option value="">Select floor</option>
                    {floors
                      .filter((f) => !assignmentForm.buildingId || f.BuildingID === Number(assignmentForm.buildingId))
                      .map((f) => (
                        <option key={f.FloorID} value={f.FloorID}>
                          Floor {f.FloorNumber}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Flat*</label>
                  <select
                    value={assignmentForm.flatId}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        flatId: e.target.value,
                        roomId: '',
                        bedId: '',
                      })
                    }
                    required
                    disabled={!assignmentForm.floorId || !!editingAssignmentId}
                  >
                    <option value="">Select flat</option>
                    {flats
                      .filter((fl) => !assignmentForm.floorId || fl.FloorID === Number(assignmentForm.floorId))
                      .map((fl) => (
                        <option key={fl.FlatID} value={fl.FlatID}>
                          Flat {fl.FlatNumber}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Room*</label>
                  <select
                    value={assignmentForm.roomId}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        roomId: e.target.value,
                        bedId: '',
                      })
                    }
                    required
                    disabled={!assignmentForm.flatId || !!editingAssignmentId}
                  >
                    <option value="">Select room</option>
                    {rooms
                      .filter((r) => !assignmentForm.flatId || r.FlatID === Number(assignmentForm.flatId))
                      .map((r) => (
                        <option key={r.RoomID} value={r.RoomID}>
                          Room {r.RoomNumber}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Bed*</label>
                  <select
                    value={assignmentForm.bedId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, bedId: e.target.value })}
                    required
                    disabled={!assignmentForm.roomId || !!editingAssignmentId}
                  >
                    <option value="">Select bed</option>
                    {beds
                      .filter(
                        (b) =>
                          b.Status === 'Available' &&
                          (!assignmentForm.roomId || b.RoomID === Number(assignmentForm.roomId))
                      )
                      .map((b) => (
                        <option key={b.BedID} value={b.BedID}>
                          {b.BedCode}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Start Date*</label>
                  <input
                    type="date"
                    value={assignmentForm.startDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={assignmentForm.endDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, endDate: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Status*</label>
                  <select
                    value={assignmentForm.status}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value })}
                  >
                    <option value="Planned">Planned</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Reason</label>
                  <input
                    value={assignmentForm.reason}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, reason: e.target.value })}
                  />
                </div>
                <button type="submit" className="primary-btn">
                  {editingAssignmentId ? 'Update Assignment' : 'Save Assignment'}
                </button>
                {editingAssignmentId && (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ marginLeft: '0.5rem', backgroundColor: '#6b7280' }}
                    onClick={() => {
                      setEditingAssignmentId(null);
                      setAssignmentForm({
                        employeeId: '',
                        buildingId: '',
                        floorId: '',
                        flatId: '',
                        roomId: '',
                        bedId: '',
                        startDate: new Date().toISOString().slice(0, 10),
                        endDate: '',
                        status: 'Active',
                        reason: '',
                      });
                      setAssignmentMessage('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
              {assignmentMessage && <p className="muted">{assignmentMessage}</p>}
            </div>

            <div className="section">
              <h2>Bed Assignments</h2>
              {assignments.length === 0 ? (
                <p className="muted">No assignments yet.</p>
              ) : (
                <>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = [
                          'Employee',
                          'Bed',
                          'Building / Room',
                          'From',
                          'To',
                          'Status',
                          'Reason',
                        ];
                        const rows = filteredAssignments.map((a) => [
                          `${a.EmployeeCode || ''} - ${a.FirstName || ''} ${a.LastName || ''}`.trim(),
                          a.BedCode || '',
                          `${a.BuildingName || ''}${
                            a.RoomNumber ? ` / Room ${a.RoomNumber}` : ''
                          }`,
                          a.StartDate ? String(a.StartDate).substring(0, 10) : '',
                          a.EndDate ? String(a.EndDate).substring(0, 10) : '',
                          a.Status || '',
                          a.Reason || '',
                        ]);
                        exportTableToCSV(headers, rows, 'assignments.csv');
                      }}
                      style={{ marginRight: '0.25rem' }}
                    >
                      Export CSV
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = [
                          'Employee',
                          'Bed',
                          'Building / Room',
                          'From',
                          'To',
                          'Status',
                          'Reason',
                        ];
                        const rows = filteredAssignments.map((a) => [
                          `${a.EmployeeCode || ''} - ${a.FirstName || ''} ${a.LastName || ''}`.trim(),
                          a.BedCode || '',
                          `${a.BuildingName || ''}${
                            a.RoomNumber ? ` / Room ${a.RoomNumber}` : ''
                          }`,
                          a.StartDate ? String(a.StartDate).substring(0, 10) : '',
                          a.EndDate ? String(a.EndDate).substring(0, 10) : '',
                          a.Status || '',
                          a.Reason || '',
                        ]);
                        exportTableToExcel(headers, rows, 'assignments.xlsx');
                      }}
                      style={{ marginRight: '0.25rem', backgroundColor: '#4b5563' }}
                    >
                      Export Excel
                    </button>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => {
                        const headers = [
                          'Employee',
                          'Bed',
                          'Building / Room',
                          'From',
                          'To',
                          'Status',
                          'Reason',
                        ];
                        const rows = filteredAssignments.map((a) => [
                          `${a.EmployeeCode || ''} - ${a.FirstName || ''} ${a.LastName || ''}`.trim(),
                          a.BedCode || '',
                          `${a.BuildingName || ''}${
                            a.RoomNumber ? ` / Room ${a.RoomNumber}` : ''
                          }`,
                          a.StartDate ? String(a.StartDate).substring(0, 10) : '',
                          a.EndDate ? String(a.EndDate).substring(0, 10) : '',
                          a.Status || '',
                          a.Reason || '',
                        ]);
                        exportTableToPDF(headers, rows, 'Bed Assignments', 'assignments.pdf');
                      }}
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      Export PDF
                    </button>
                  </div>
                  <div className="data-grid">
                    <table>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Bed</th>
                        <th>Building / Room</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Status</th>
                        <th>Reason</th>
                        <th>Actions</th>
                      </tr>
                      <tr>
                        <th>
                          <input
                            placeholder="Filter"
                            list="assign-emp-options"
                            value={assignmentFilter.employee}
                            onChange={(e) =>
                              setAssignmentFilter({
                                ...assignmentFilter,
                                employee: e.target.value,
                              })
                            }
                          />
                          <datalist id="assign-emp-options">
                            {Array.from(
                              new Set(
                                assignments.map(
                                  (a) =>
                                    `${a.EmployeeCode || ''} ${a.FirstName || ''} ${
                                      a.LastName || ''
                                    }`.trim() || ''
                                )
                              )
                            )
                              .filter((v) => v)
                              .map((n) => (
                                <option key={n} value={n} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="assign-bed-options"
                            value={assignmentFilter.bed}
                            onChange={(e) =>
                              setAssignmentFilter({ ...assignmentFilter, bed: e.target.value })
                            }
                          />
                          <datalist id="assign-bed-options">
                            {Array.from(new Set(assignments.map((a) => a.BedCode || ''))) 
                              .filter((v) => v)
                              .map((c) => (
                                <option key={c} value={c} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="assign-buildingroom-options"
                            value={assignmentFilter.buildingRoom}
                            onChange={(e) =>
                              setAssignmentFilter({
                                ...assignmentFilter,
                                buildingRoom: e.target.value,
                              })
                            }
                          />
                          <datalist id="assign-buildingroom-options">
                            {Array.from(
                              new Set(
                                assignments.map(
                                  (a) => `${a.BuildingName || ''} ${a.RoomNumber || ''}`.trim() || ''
                                )
                              )
                            )
                              .filter((v) => v)
                              .map((br) => (
                                <option key={br} value={br} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="YYYY-MM-DD"
                            value={assignmentFilter.from}
                            onChange={(e) =>
                              setAssignmentFilter({ ...assignmentFilter, from: e.target.value })
                            }
                          />
                        </th>
                        <th>
                          <input
                            placeholder="YYYY-MM-DD"
                            value={assignmentFilter.to}
                            onChange={(e) =>
                              setAssignmentFilter({ ...assignmentFilter, to: e.target.value })
                            }
                          />
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="assign-status-options"
                            value={assignmentFilter.status}
                            onChange={(e) =>
                              setAssignmentFilter({
                                ...assignmentFilter,
                                status: e.target.value,
                              })
                            }
                          />
                          <datalist id="assign-status-options">
                            {Array.from(new Set(assignments.map((a) => a.Status || ''))) 
                              .filter((v) => v)
                              .map((s) => (
                                <option key={s} value={s} />
                              ))}
                          </datalist>
                        </th>
                        <th>
                          <input
                            placeholder="Filter"
                            list="assign-reason-options"
                            value={assignmentFilter.reason}
                            onChange={(e) =>
                              setAssignmentFilter({
                                ...assignmentFilter,
                                reason: e.target.value,
                              })
                            }
                          />
                          <datalist id="assign-reason-options">
                            {Array.from(new Set(assignments.map((a) => a.Reason || ''))) 
                              .filter((v) => v)
                              .map((r) => (
                                <option key={r} value={r} />
                              ))}
                          </datalist>
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((a) => (
                        <tr key={a.AssignmentID}>
                          <td>
                            {a.EmployeeCode} - {a.FirstName} {a.LastName}
                          </td>
                          <td>{a.BedCode}</td>
                          <td>
                            {a.BuildingName}
                            {a.RoomNumber ? ` / Room ${a.RoomNumber}` : ''}
                          </td>
                          <td>{a.StartDate ? String(a.StartDate).substring(0, 10) : ''}</td>
                          <td>{a.EndDate ? String(a.EndDate).substring(0, 10) : ''}</td>
                          <td>{a.Status}</td>
                          <td>{a.Reason}</td>
                          <td>
                            <span className="row-actions">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => startEditAssignment(a)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="icon-btn danger"
                                onClick={() => handleDeleteAssignment(a.AssignmentID, a.BedID)}
                              >
                                Del
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
