const Database = require('better-sqlite3');

// 🔥 Crear la base de datos en la raíz (compatible con Render)
const db = new Database('database.db');

// 🔥 CREAR TABLAS SI NO EXISTEN
db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        deuda REAL,
        fecha TEXT
    );

    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        nombre TEXT,
        precio REAL
    );

    CREATE TABLE IF NOT EXISTS pagos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        monto REAL,
        fecha TEXT
    );
`);

module.exports = db;