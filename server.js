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

    const search = (req.query.search || '').toLowerCase();

    let query = `SELECT * FROM clientes`;

    if (search) {
        query += ` WHERE LOWER(nombre) LIKE ?`;
    }

    const param = search ? [`%${search}%`] : [];

    db.all(query, param, (err, clientes) => {

        if (err) return res.status(500).json(err);

        const promises = clientes.map(cliente => {
            return new Promise((resolve) => {

                db.all(
                    `SELECT * FROM productos WHERE cliente_id = ?`,
                    [cliente.id],
                    (err, productos) => {

                        db.all(
                            `SELECT * FROM pagos WHERE cliente_id = ?`,
                            [cliente.id],
                            (err, pagos) => {

                                cliente.productos = productos || [];
                                cliente.pagos = pagos || [];

                                resolve(cliente);
                            }
                        );
                    }
                );
            });
        });

        Promise.all(promises).then(result => {
            res.json(result);
        });

    });
});


// ➕ Agregar cliente
app.post('/clientes', (req, res) => {

    const { nombre, productos } = req.body;

    const productosValidos = (productos || []).filter(p => p.nombre);

    const deuda = productosValidos.reduce((sum, p) => sum + (p.precio || 0), 0);

    db.run(
        `INSERT INTO clientes (nombre, deuda, fecha) VALUES (?, ?, ?)`,
        [nombre, deuda, new Date()],
        function (err) {

            if (err) return res.status(500).send(err);

            const clienteId = this.lastID;

            productosValidos.forEach(p => {
                db.run(
                    `INSERT INTO productos (cliente_id, nombre, precio) VALUES (?, ?, ?)`,
                    [clienteId, p.nombre, p.precio]
                );
            });

            res.sendStatus(200);
        }
    );
});


// ➕ Agregar productos a cliente
app.post('/clientes/:id/productos', (req, res) => {

    const clienteId = req.params.id;
    const productos = req.body.productos || [];

    let totalExtra = 0;

    productos.forEach(p => {
        if (p.nombre) {
            db.run(
                `INSERT INTO productos (cliente_id, nombre, precio) VALUES (?, ?, ?)`,
                [clienteId, p.nombre, p.precio]
            );

            totalExtra += (p.precio || 0);
        }
    });

    db.run(
        `UPDATE clientes SET deuda = deuda + ? WHERE id = ?`,
        [totalExtra, clienteId]
    );

    res.sendStatus(200);
});


// 💰 Registrar pago
app.post('/pago/:id', (req, res) => {

    const clienteId = req.params.id;
    const { monto } = req.body;

    db.run(
        `INSERT INTO pagos (cliente_id, monto, fecha) VALUES (?, ?, ?)`,
        [clienteId, monto, new Date()],
        (err) => {
            if (err) return res.status(500).send(err);
            res.sendStatus(200);
        }
    );
});


// ❌ Eliminar cliente
app.delete('/clientes/:id', (req, res) => {

    const id = req.params.id;

    db.run(`DELETE FROM clientes WHERE id = ?`, [id]);
    db.run(`DELETE FROM productos WHERE cliente_id = ?`, [id]);
    db.run(`DELETE FROM pagos WHERE cliente_id = ?`, [id]);

    res.sendStatus(200);
});

//////////////////////////////
// 🏠 RUTA PRINCIPAL
//////////////////////////////

// 🔥 Esto evita "Cannot GET /"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pagos/index.html'));
});

//////////////////////////////
// 🚀 SERVIDOR
//////////////////////////////

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});