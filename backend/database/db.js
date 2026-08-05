const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPathSetting = process.env.DB_PATH || 'database/hospital.db';
const fullDbPath = path.isAbsolute(dbPathSetting) 
  ? dbPathSetting 
  : path.join(__dirname, '..', dbPathSetting);

// Ensure database directory exists
const dbDir = path.dirname(fullDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(fullDbPath);

// Enable WAL mode for better concurrency performance
db.pragma('journal_mode = WAL');

// Read schema and initialize tables
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

module.exports = db;
