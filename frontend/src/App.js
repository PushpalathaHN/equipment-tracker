import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/equipment";

function App() {
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "Machine",
    status: "Active",
    lastCleaned: "",
  });
  const [editId, setEditId] = useState(null);

  // BONUS STATES
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  // Fetch equipment list
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setEquipment(Array.isArray(data) ? data : []));
  }, []);

  // Add / Update equipment
  const saveEquipment = () => {
    if (!form.name.trim() || !form.lastCleaned) {
      alert("Please fill all fields");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_URL}/${editId}` : API_URL;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(() => {
        setEditId(null);
        setForm({
          name: "",
          type: "Machine",
          status: "Active",
          lastCleaned: "",
        });
        return fetch(API_URL);
      })
      .then(res => res.json())
      .then(data => setEquipment(Array.isArray(data) ? data : []));
  };

  // Edit equipment
  const editItem = item => {
    setEditId(item.id);
    setForm({
      name: item.name,
      type: item.type,
      status: item.status,
      lastCleaned: item.last_cleaned.slice(0, 10),
    });
  };

  // Delete equipment
  const deleteItem = id => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() =>
        setEquipment(prev => prev.filter(e => e.id !== id))
      );
  };

  // 🔍 FILTER
  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    item.status.toLowerCase().includes(search.toLowerCase())
  );

  // ↕ SORT
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>Equipment Tracker Dashboard</h1>
        <p>Manage and monitor equipment status</p>
      </div>

      {/* Form Card */}
      <div className="card">
        <h3>{editId ? "Edit Equipment" : "Add New Equipment"}</h3>

        <div className="form-row">
          <input
            placeholder="Equipment Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option>Machine</option>
            <option>Vessel</option>
            <option>Tank</option>
            <option>Mixer</option>
          </select>

          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option>Active</option>
            <option>Inactive</option>
            <option>Under Maintenance</option>
          </select>

          <input
            type="date"
            value={form.lastCleaned}
            onChange={e =>
              setForm({ ...form, lastCleaned: e.target.value })
            }
          />
        </div>

        <button className="primary-btn" onClick={saveEquipment}>
          {editId ? "Update Equipment" : "Add Equipment"}
        </button>
      </div>

      {/* Table Card */}
      <div className="card table-card">
        <h3>Equipment List</h3>

        {/* 🔍 Search */}
        <input
          className="search-input"
          placeholder="Search by name, type or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Scrollable Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>Name</th>
                <th onClick={() => handleSort("type")}>Type</th>
                <th onClick={() => handleSort("status")}>Status</th>
                <th onClick={() => handleSort("last_cleaned")}>
                  Last Cleaned
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEquipment.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    No equipment found
                  </td>
                </tr>
              ) : (
                sortedEquipment.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>
                      <span
                        className={`status ${item.status.replaceAll(
                          " ",
                          "-"
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {new Date(item.last_cleaned).toLocaleDateString()}
                    </td>
                    <td className="actions">
                      <button
                        className="secondary-btn"
                        onClick={() => editItem(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger-btn"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
