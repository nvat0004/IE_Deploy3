import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";
import fs from "fs";
import csv from "csv-parser";

const pool = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
});

const csvPath = (name) => `./datasets/${name}`;

function loadCSV(file) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(file)
      .pipe(csv())
      .on("data", (r) => rows.push(r))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

const n = (v) => (v === "" || v == null ? null : Number(v));
const s = (v) => (v === "" || v == null ? null : String(v));
const get = (row, ...names) => {
  for (const n of names) {
    if (n in row && row[n] !== "") return row[n];
  }
  return null;
};

function toISODate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const dateOnly = raw.includes(" ") ? raw.split(" ")[0] : raw;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateOnly)) {
    const [dd, mm, yyyy] = dateOnly.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateOnly)) {
    const [yyyy, mm, dd] = dateOnly.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return dateOnly;

  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

async function batchInsert(conn, sql, rows, chunkSize = 1000) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await conn.query(sql, [chunk]);
  }
}

/* -----------------------------------------------------------
   EXISTING (unchanged) TABLES
----------------------------------------------------------- */
async function ensureTables() {
  const conn = await pool.getConnection();
  await conn.query(`DROP TABLE IF EXISTS water_quality`);
  await conn.query(`DROP TABLE IF EXISTS enterococci`);
  await conn.query(`DROP TABLE IF EXISTS daily_rainfall`);

  await conn.query(`
    CREATE TABLE water_quality (
      id INT AUTO_INCREMENT PRIMARY KEY,
      site_id INT NULL,
      site_name VARCHAR(255) NULL,
      date DATE NULL,
      day VARCHAR(20) NULL,
      month VARCHAR(20) NULL,
      year INT NULL,
      chlorophyll FLOAT NULL,
      dissolved_oxygen FLOAT NULL,
      salinity FLOAT NULL,
      turbidity FLOAT NULL,
      oxygen_saturation FLOAT NULL,
      temperature FLOAT NULL,
      pH FLOAT NULL,
      suspended_solids FLOAT NULL,
      ammonia FLOAT NULL,
      total_nitrogen FLOAT NULL,
      total_phosphorus FLOAT NULL
    );
  `);

  await conn.query(`
    CREATE TABLE enterococci (
      id INT AUTO_INCREMENT PRIMARY KEY,
      site_id INT NULL,
      site_name VARCHAR(255) NULL,
      sample_datetime DATETIME NULL,
      date DATE NULL,
      day VARCHAR(20) NULL,
      month VARCHAR(20) NULL,
      year INT NULL,
      hour INT NULL,
      minute INT NULL,
      enterococci_value INT NULL,
      enterococci_level INT NULL,
      beach VARCHAR(255) NULL
    );
  `);

  await conn.query(`
    CREATE TABLE daily_rainfall (
      id INT AUTO_INCREMENT PRIMARY KEY,
      site_id INT NULL,
      site_name VARCHAR(255) NULL,
      datetime DATETIME NULL,
      date DATE NULL,
      day VARCHAR(20) NULL,
      month VARCHAR(20) NULL,
      year INT NULL,
      rainfall_mm FLOAT NULL,
      beach VARCHAR(255) NULL
    );
  `);

  conn.release();
  console.log("✅ Tables recreated with full + compat columns");
}

async function insertWaterQuality() {
  const file = csvPath("water_quality_cleaned.csv");
  if (!fs.existsSync(file)) {
    console.log("ℹ️ Skipped water_quality (no CSV found)");
    return;
  }
  const data = await loadCSV(file);

  const rows = data.map((row) => {
    const date = toISODate(get(row, "date", "date_time", "Date"));
    const siteName = s(get(row, "site_name", "site_area", "Site"));
    const siteId = n(get(row, "site_id", "site_area_id"));

    const d = date ? new Date(date) : null;
    const day = s(get(row, "day", "Day")) ?? (d ? String(d.getDate()).padStart(2, "0") : null);
    const month = s(get(row, "month", "Month")) ?? (d ? String(d.getMonth() + 1).padStart(2, "0") : null);
    const year = n(get(row, "year", "Year")) ?? (d ? d.getFullYear() : null);

    return [
      siteId,
      siteName,
      date,
      day,
      month,
      year,
      n(get(row, "chlorophyll", "Chlorophyll-a Concentration (ug/L)")),
      n(get(row, "dissolved_oxygen", "Dissolved Oxygen (mg/L)")),
      n(get(row, "salinity", "Salinity (PSU)")),
      n(get(row, "turbidity", "Turbidity")),
      n(get(row, "oxygen_saturation", "Dissolved Oxygen Saturation Percentage (%)")),
      n(get(row, "temperature", "Water Temperature (%)")),
      n(get(row, "pH", "pH Level")),
      n(get(row, "suspended_solids", "Suspended Solids (mg/L)")),
      n(get(row, "ammonia", "Ammonia (ug/L)")),
      n(get(row, "total_nitrogen", "Total Nitrogen (ug/L)")),
      n(get(row, "total_phosphorus", "Total Phosphorus (ug/L)")),
    ];
  });

  const conn = await pool.getConnection();
  await batchInsert(
    conn,
    `
      INSERT INTO water_quality (
        site_id, site_name, date, day, month, year,
        chlorophyll, dissolved_oxygen, salinity, turbidity, oxygen_saturation,
        temperature, pH, suspended_solids, ammonia, total_nitrogen, total_phosphorus
      ) VALUES ?
    `,
    rows
  );
  conn.release();
  console.log(`✅ water_quality: inserted ${rows.length} rows`);
}

async function insertEnterococci() {
  const file = csvPath("enterococci_cleaned.csv");
  if (!fs.existsSync(file)) {
    console.log("ℹ️ Skipped enterococci (no CSV found)");
    return;
  }
  const data = await loadCSV(file);

  const rows = data.map((row) => {
    const sampleDT = get(row, "sample_datetime", "datetime");
    const date = toISODate(get(row, "date", "Date") ?? (sampleDT ? String(sampleDT).split(" ")[0] : null));
    const siteName = s(get(row, "site_name", "site_area", "Site"));
    const siteId = n(get(row, "site_id", "site_area_id"));
    const beach = s(get(row, "beach", "Beach"));

    const dt = sampleDT ? new Date(sampleDT) : date ? new Date(date) : null;
    const day = s(get(row, "day", "Day")) ?? (dt ? String(dt.getDate()).padStart(2, "0") : null);
    const month = s(get(row, "month", "Month")) ?? (dt ? String(dt.getMonth() + 1).padStart(2, "0") : null);
    const year = n(get(row, "year", "Year")) ?? (dt ? dt.getFullYear() : null);
    const hour = n(get(row, "hour", "Hour")) ?? (dt ? dt.getHours() : null);
    const minute = n(get(row, "minute", "Minute")) ?? (dt ? dt.getMinutes() : null);

    const value = n(get(row, "enterococci_value", "Enterococci", "enterococci", "value"));
    const level = n(get(row, "enterococci_level")) ?? value;

    return [
      siteId,
      siteName,
      sampleDT ? new Date(sampleDT) : null,
      date,
      day,
      month,
      year,
      hour,
      minute,
      value,
      level,
      beach,
    ];
  });

  const conn = await pool.getConnection();
  await batchInsert(
    conn,
    `
      INSERT INTO enterococci (
        site_id, site_name, sample_datetime, date, day, month, year,
        hour, minute, enterococci_value, enterococci_level, beach
      ) VALUES ?
    `,
    rows
  );
  conn.release();
  console.log(`✅ enterococci: inserted ${rows.length} rows`);
}

async function insertRainfall() {
  const file = csvPath("daily_rainfall_cleaned.csv");
  if (!fs.existsSync(file)) {
    console.log("ℹ️ Skipped daily_rainfall (no CSV found)");
    return;
  }
  const data = await loadCSV(file);

  const rows = data.map((row) => {
    const fullDT = get(row, "datetime", "date_time");
    const date = toISODate(get(row, "date", "Date") ?? (fullDT ? String(fullDT).split(" ")[0] : null));
    const siteName = s(get(row, "site_name", "site_area", "Site"));
    const siteId = n(get(row, "site_id", "site_area_id"));
    const beach = s(get(row, "beach", "Beach"));
    const dt = fullDT ? new Date(fullDT) : date ? new Date(date) : null;

    const day = s(get(row, "day", "Day")) ?? (dt ? String(dt.getDate()).padStart(2, "0") : null);
    const month = s(get(row, "month", "Month")) ?? (dt ? String(dt.getMonth() + 1).padStart(2, "0") : null);
    const year = n(get(row, "year", "Year")) ?? (dt ? dt.getFullYear() : null);
    const rainfall = n(get(row, "rainfall_mm", "Rainfall"));

    return [
      siteId,
      siteName,
      fullDT ? new Date(fullDT) : null,
      date,
      day,
      month,
      year,
      rainfall,
      beach,
    ];
  });

  const conn = await pool.getConnection();
  await batchInsert(
    conn,
    `
      INSERT INTO daily_rainfall (
        site_id, site_name, datetime, date, day, month, year, rainfall_mm, beach
      ) VALUES ?
    `,
    rows
  );
  conn.release();
  console.log(`✅ daily_rainfall: inserted ${rows.length} rows`);
}

/* -----------------------------------------------------------
   NEW: Generic CSV → Table loader that preserves headers exactly
   - Creates table with TEXT columns matching CSV headers
   - Inserts all rows as-is ("" → NULL)
----------------------------------------------------------- */
const escapeIdent = (name) => String(name).replace(/`/g, "``");
const normalizeValue = (v) => (v === "" || v == null ? null : String(v));

async function ensureAndInsertFromArbitraryCSV(tableName, csvFilename) {
  const file = csvPath(csvFilename);
  if (!fs.existsSync(file)) {
    console.log(`ℹ️ Skipped ${tableName} (no CSV found: ${csvFilename})`);
    return;
  }

  const data = await loadCSV(file);
  if (!data.length) {
    console.log(`ℹ️ Skipped ${tableName} (CSV empty)`);
    return;
  }

  // Preserve original header order from first row
  const first = data[0];
  const headers = Object.keys(first);

  // Create table with columns exactly as in CSV (TEXT NULL), no extra columns
  const conn = await pool.getConnection();
  const colsDDL = headers
    .map((h) => `\`${escapeIdent(h)}\` TEXT NULL`)
    .join(", ");

  await conn.query(`DROP TABLE IF EXISTS \`${escapeIdent(tableName)}\``);
  await conn.query(`CREATE TABLE \`${escapeIdent(tableName)}\` (${colsDDL})`);
  console.log(`✅ Created ${tableName} with ${headers.length} columns`);

  // Build parameterized INSERT
  const colListSQL = headers.map((h) => `\`${escapeIdent(h)}\``).join(", ");
  const rows = data.map((row) => headers.map((h) => normalizeValue(row[h])));

  await batchInsert(
    conn,
    `INSERT INTO \`${escapeIdent(tableName)}\` (${colListSQL}) VALUES ?`,
    rows
  );

  conn.release();
  console.log(`✅ ${tableName}: inserted ${rows.length} rows`);
}

/* -----------------------------------------------------------
   NEW: Specific loaders for your two datasets
----------------------------------------------------------- */
async function insertBeachFacilities() {
  return ensureAndInsertFromArbitraryCSV(
    "beach_facilities",
    "Port Phillip Bay Beach Datasets - Beach Facilities.csv"
  );
}

async function insertBeachNaturalFeatures() {
  return ensureAndInsertFromArbitraryCSV(
    "beach_natural_features",
    "Port Phillip Bay Beach Datasets - Beach Natural Features.csv"
  );
}

/* -----------------------------------------------------------
   MAIN
----------------------------------------------------------- */
async function main() {
  try {
    console.log("⏳ Recreating tables...");
    await ensureTables();

    console.log("⏳ Inserting water_quality...");
    await insertWaterQuality();

    console.log("⏳ Inserting enterococci...");
    await insertEnterococci();

    console.log("⏳ Inserting daily_rainfall...");
    await insertRainfall();

    // New datasets (added, independent of existing functionality)
    console.log("⏳ Inserting beach_facilities...");
    await insertBeachFacilities();

    console.log("⏳ Inserting beach_natural_features...");
    await insertBeachNaturalFeatures();

    console.log("🎉 Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

main();
