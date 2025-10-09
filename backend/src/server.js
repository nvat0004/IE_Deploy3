// ✅ server.js — ES Module Compatible
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
app.use(cors());

// ✅ DB connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Utility functions
function getSafetyStatus(value) {
  if (value <= 35) return "Safe";
  if (value <= 104) return "Moderate";
  return "Dangerous";
}

function getReason(value) {
  if (value <= 35)
    return "Safe — Bacteria level in the water is in safe range(0–35)";
  if (value <= 104)
    return "Moderate — Caution advised due to moderate Bacteria levels (36–104)";
  return "Dangerous — Swimming not advised (Bacteria level >104)";
}

// ✅ NEW: Beaches list (using actual column name `site_name`)
app.get("/api/beaches", async (req, res) => {
  try {
    // get distinct site_name from both tables
    const [facilities] = await pool.query(
      `SELECT DISTINCT site_name FROM beach_facilities`
    );
    const [hazards] = await pool.query(
      `SELECT DISTINCT site_name FROM beach_natural_features`
    );

    const all = [
      ...facilities.map((f) => f.site_name),
      ...hazards.map((h) => h.site_name),
    ];
    const unique = [...new Set(all)].sort();

    // format for Vue dropdown
    const formatted = unique.map((name, idx) => ({
      site_name_id: idx + 1,
      site_name: name,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("/api/beaches error:", err);
    res.status(500).json({ error: "Failed to fetch beaches." });
  }
});

// ✅ NEW: Hazard info for a given beach
app.get("/api/hazard", async (req, res) => {
  const beach = req.query.beach;
  if (!beach) return res.status(400).json({ error: "Beach is required" });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM beach_natural_features WHERE site_name = ? LIMIT 1`,
      [beach]
    );
    if (!rows.length) return res.status(404).json({ error: "No hazard data found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("/api/hazard error:", err);
    res.status(500).json({ error: "Failed to fetch hazard info." });
  }
});

// ✅ NEW: Facilities info for a given beach
app.get("/api/facilities", async (req, res) => {
  const beach = req.query.beach;
  if (!beach) return res.status(400).json({ error: "Beach is required" });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM beach_facilities WHERE site_name = ? LIMIT 1`,
      [beach]
    );
    if (!rows.length)
      return res.status(404).json({ error: "No facilities data found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("/api/facilities error:", err);
    res.status(500).json({ error: "Failed to fetch facilities info." });
  }
});

// ✅ Today's Swimming Safety — unchanged
app.get("/api/today-safety", async (req, res) => {
  try {
    const site = req.query.beach || "Frankston Beach";

    const [result] = await pool.query(
      `SELECT date, enterococci_level 
       FROM enterococci 
       WHERE LOWER(site_name) = LOWER(?) 
       ORDER BY date DESC 
       LIMIT 30`,
      [site]
    );

    if (!result.length) {
      return res.json({ status: "No Data", reason: "No safety data found." });
    }

    // Calculate moving average from latest 30 records
    const avg =
      result.reduce((sum, row) => sum + (row.enterococci_level || 0), 0) /
      result.length;

    // 🎯 Add variation: avg - 40 to avg + 80
    const simulated = avg + Math.round(Math.random() * 70 - 40);
    const finalValue = Math.max(0, simulated); // avoid negative values

    res.json({
      status: getSafetyStatus(finalValue),
      reason: getReason(finalValue),
      date: new Date().toISOString().split("T")[0],
    });
  } catch (err) {
    console.error("/api/today-safety error:", err);
    res.status(500).send("Server error");
  }
});

// ✅ 7-Day Prediction — unchanged
app.get("/api/predict", async (req, res) => {
  try {
    const site = req.query.beach || "Frankston Beach";
    const [rows] = await pool.query(
      `SELECT date, enterococci_level 
       FROM enterococci 
       WHERE LOWER(site_name) = LOWER(?) 
       ORDER BY date DESC 
       LIMIT 30`,
      [site]
    );

    if (!rows.length) {
      return res.json([]);
    }

    const avg =
      rows.reduce((sum, row) => sum + (row.enterococci_level || 0), 0) /
      rows.length;

    const predictions = Array.from({ length: 7 }, (_, i) => {
      const predicted = avg + Math.round(Math.random() * 120 - 40);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      return {
        date: futureDate.toISOString().split("T")[0],
        status: getSafetyStatus(predicted),
        reason: getReason(predicted),
      };
    });

    res.json(predictions);
  } catch (err) {
    console.error("/api/predict error:", err);
    res.status(500).send("Prediction error");
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
