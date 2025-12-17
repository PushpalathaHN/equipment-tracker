const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  database: "equipment_tracker",
  port: 5432,
});


/* GET all equipment */
app.get("/api/equipment", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM equipment ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ADD equipment */
app.post("/api/equipment", async (req, res) => {
  const { name, type, status, lastCleaned } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO equipment (name, type, status, last_cleaned) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, type, status, lastCleaned]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* UPDATE equipment */
app.put("/api/equipment/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, status, lastCleaned } = req.body;

  try {
    await pool.query(
      "UPDATE equipment SET name=$1, type=$2, status=$3, last_cleaned=$4 WHERE id=$5",
      [name, type, status, lastCleaned, id]
    );
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE equipment */
app.delete("/api/equipment/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM equipment WHERE id=$1", [
      req.params.id,
    ]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
