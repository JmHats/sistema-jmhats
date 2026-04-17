const Database = require('better-sqlite3');
const path = require('path');

// 🔥 usar carpeta database
const dbPath = path.join(__dirname, 'data.db');

const db = new Database(dbPath);

// TABLAS
db.prepare(`
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    deuda REAL,
    fecha TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    nombre TEXT,
    precio REAL
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    monto REAL,
    fecha TEXT
)
`).run();

module.exports = db;