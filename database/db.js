const Database = require('better-sqlite3');

const path = require('path');

// ======================
// BASE DATOS
// ======================

const dbPath =
    path.join(
        __dirname,
        'data.db'
    );

const db =
    new Database(dbPath);

// ======================
// CLIENTES
// ======================

db.prepare(`
CREATE TABLE IF NOT EXISTS clientes (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nombre TEXT,

    deuda REAL,

    fecha TEXT

)
`).run();

// ======================
// PRODUCTOS CLIENTES
// ======================

db.prepare(`
CREATE TABLE IF NOT EXISTS productos (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    cliente_id INTEGER,

    nombre TEXT,

    precio REAL

)
`).run();

// ======================
// PAGOS
// ======================

db.prepare(`
CREATE TABLE IF NOT EXISTS pagos (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    cliente_id INTEGER,

    monto REAL,

    fecha TEXT

)
`).run();

// ======================
// INVENTARIO
// ======================

db.prepare(`
CREATE TABLE IF NOT EXISTS inventario (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    codigo TEXT,

    nombre TEXT,

    talla TEXT,

    marca TEXT,

    color TEXT,

    categoria TEXT,

    subcategoria TEXT,

    cantidad TEXT,

    sucursal TEXT,

    mercadoLibre TEXT,

    pagina TEXT,

    tiktok TEXT,

    imagen TEXT,

    fecha TEXT

)
`).run();

module.exports = db;