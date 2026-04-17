const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error al conectar DB", err);
    } else {
        console.log("SQLite conectado 🔥");
    }
});

// 🔥 CREAR TABLAS
db.serialize(() => {

    // CLIENTES
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            deuda REAL,
            fecha TEXT
        )
    `);

    // PRODUCTOS DE CLIENTE
    db.run(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER,
            nombre TEXT,
            precio REAL
        )
    `);

    // PAGOS
    db.run(`
        CREATE TABLE IF NOT EXISTS pagos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER,
            monto REAL,
            fecha TEXT
        )
    `);

});

module.exports = db;