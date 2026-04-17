const express = require('express');
const path = require('path');
const db = require('./database/db');

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
        console.error(error);
        res.status(500).json(error);
    }
});


// ➕ Agregar cliente
app.post('/clientes', (req, res) => {
    try {
        const { nombre, productos } = req.body;

        const productosValidos = (productos || []).filter(p => p.nombre);

        const deuda = productosValidos.reduce(
            (sum, p) => sum + (p.precio || 0), 0
        );

        const result = db.prepare(
            `INSERT INTO clientes (nombre, deuda, fecha) VALUES (?, ?, ?)`
        ).run(nombre, deuda, new Date());

        const clienteId = result.lastInsertRowid;

        productosValidos.forEach(p => {
            db.prepare(
                `INSERT INTO productos (cliente_id, nombre, precio) VALUES (?, ?, ?)`
            ).run(clienteId, p.nombre, p.precio);
        });

        res.sendStatus(200);

    } catch (error) {
        console.error(error);
        res.status(500).send(error);
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
        console.error(error);
        res.status(500).send(error);
    }
});


// 💰 Registrar pago
app.post('/pago/:id', (req, res) => {
    try {
        const clienteId = req.params.id;
        const { monto } = req.body;

        db.prepare(
            `INSERT INTO pagos (cliente_id, monto, fecha) VALUES (?, ?, ?)`
        ).run(clienteId, monto, new Date());

        res.sendStatus(200);

    } catch (error) {
        console.error(error);
        res.status(500).send(error);
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
        console.error(error);
        res.status(500).send(error);
    }
});

//////////////////////////////
// 🏠 RUTA PRINCIPAL
//////////////////////////////

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pagos/index.html'));
});

//////////////////////////////
// 🚀 SERVIDOR (FIX RENDER)
//////////////////////////////

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});