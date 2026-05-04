const express = require('express');
const path = require('path');
//const db = require('./database/db');

const app = express();

// 🔥 MIDDLEWARES
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//////////////////////////////
// 🔷 CLIENTES
//////////////////////////////

// 🔍 Obtener clientes con productos y pagos
app.get('/clientes', (req, res) => {
    try {
        const search = (req.query.search || '').toLowerCase();

        let query = `SELECT * FROM clientes`;
        let params = [];

        if (search) {
            query += ` WHERE LOWER(nombre) LIKE ?`;
            params.push(`%${search}%`);
        }

        const clientes = db.prepare(query).all(...params);

        const result = clientes.map(cliente => {
            const productos = db.prepare(
                `SELECT * FROM productos WHERE cliente_id = ?`
            ).all(cliente.id);

            const pagos = db.prepare(
                `SELECT * FROM pagos WHERE cliente_id = ?`
            ).all(cliente.id);

            return {
                ...cliente,
                productos,
                pagos
            };
        });

        res.json(result);

    } catch (error) {
        console.error("ERROR GET CLIENTES:", error);
        res.status(500).send(error.message);
    }
});


// ➕ Agregar cliente
app.post('/clientes', (req, res) => {
    try {
        const { nombre, productos } = req.body;

        if (!nombre) {
            return res.status(400).send("Nombre requerido");
        }

        const productosValidos = (productos || []).filter(p => p.nombre);

        const deuda = productosValidos.reduce(
            (sum, p) => sum + (p.precio || 0), 0
        );

        const result = db.prepare(
            `INSERT INTO clientes (nombre, deuda, fecha) VALUES (?, ?, ?)`
        ).run(nombre, deuda, new Date().toISOString());

        const clienteId = result.lastInsertRowid;

        productosValidos.forEach(p => {
            db.prepare(
                `INSERT INTO productos (cliente_id, nombre, precio) VALUES (?, ?, ?)`
            ).run(clienteId, p.nombre, p.precio);
        });

        res.sendStatus(200);

    } catch (error) {
        console.error("ERROR POST CLIENTES:", error);
        res.status(500).send(error.message);
    }
});


// ➕ Agregar productos a cliente
app.post('/clientes/:id/productos', (req, res) => {
    try {
        const clienteId = req.params.id;
        const productos = req.body.productos || [];

        let totalExtra = 0;

        productos.forEach(p => {
            if (p.nombre) {
                db.prepare(
                    `INSERT INTO productos (cliente_id, nombre, precio) VALUES (?, ?, ?)`
                ).run(clienteId, p.nombre, p.precio);

                totalExtra += (p.precio || 0);
            }
        });

        db.prepare(
            `UPDATE clientes SET deuda = deuda + ? WHERE id = ?`
        ).run(totalExtra, clienteId);

        res.sendStatus(200);

    } catch (error) {
        console.error("ERROR AGREGAR PRODUCTOS:", error);
        res.status(500).send(error.message);
    }
});


// 💰 Registrar pago
app.post('/pago/:id', (req, res) => {
    try {
        const clienteId = req.params.id;
        const { monto } = req.body;

        db.prepare(
            `INSERT INTO pagos (cliente_id, monto, fecha) VALUES (?, ?, ?)`
        ).run(clienteId, monto, new Date().toISOString());

        res.sendStatus(200);

    } catch (error) {
        console.error("ERROR PAGO:", error);
        res.status(500).send(error.message);
    }
});


// ❌ Eliminar cliente
app.delete('/clientes/:id', (req, res) => {
    try {
        const id = req.params.id;

        db.prepare(`DELETE FROM clientes WHERE id = ?`).run(id);
        db.prepare(`DELETE FROM productos WHERE cliente_id = ?`).run(id);
        db.prepare(`DELETE FROM pagos WHERE cliente_id = ?`).run(id);

        res.sendStatus(200);

    } catch (error) {
        console.error("ERROR DELETE:", error);
        res.status(500).send(error.message);
    }
});

//////////////////////////////
// 🏠 RUTA PRINCIPAL
//////////////////////////////

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pagos/index.html'));
});

//////////////////////////////
// 🚀 SERVIDOR (IMPORTANTE PARA RENDER)
//////////////////////////////

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

const multer = require('multer');

// CONFIG IMÁGENES
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

//////////////////////////////
// INVENTARIO
//////////////////////////////

app.get('/inventario', (req, res) => {
    const data = db.prepare('SELECT * FROM inventario ORDER BY id DESC').all();
    res.json(data);
});

app.post('/inventario', upload.single('imagen'), (req, res) => {

    const {
        codigo, nombre, talla, marca, color,
        categoria, subcategoria,
        mercadoLibre, pagina, tiktok
    } = req.body;

    db.prepare(`
        INSERT INTO inventario
        (codigo, nombre, talla, marca, color, categoria, subcategoria, mercadoLibre, pagina, tiktok, imagen, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        codigo,
        nombre,
        talla,
        marca,
        color,
        categoria,
        subcategoria,
        mercadoLibre ? 1 : 0,
        pagina ? 1 : 0,
        tiktok ? 1 : 0,
        req.file ? '/uploads/' + req.file.filename : '',
        new Date().toISOString()
    );

    res.sendStatus(200);
});