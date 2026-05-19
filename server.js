const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
const path = require('path');

const app = express();
const db = new Database('database.db');

// ======================
// MIDDLEWARES
// ======================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static('public'));

app.use(
    '/uploads',
    express.static('public/uploads')
);

// ======================
// MULTER
// ======================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, 'public/uploads');

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );

    }

});

const upload = multer({
    storage
});

// ======================
// TABLAS
// ======================

db.prepare(`

CREATE TABLE IF NOT EXISTS productos (

    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,

    codigo TEXT,
    nombre TEXT,
    marca TEXT,
    categoria TEXT,
    genero TEXT,
    precio REAL,
    imagen TEXT

)

`).run();

db.prepare(`

CREATE TABLE IF NOT EXISTS variantes (

    id_variante INTEGER PRIMARY KEY AUTOINCREMENT,

    id_producto INTEGER,

    color TEXT,
    talla TEXT

)

`).run();

db.prepare(`

CREATE TABLE IF NOT EXISTS sucursales (

    id_sucursal INTEGER PRIMARY KEY AUTOINCREMENT,

    id_producto INTEGER,
    id_variante INTEGER,

    sucursal TEXT

)

`).run();

db.prepare(`

CREATE TABLE IF NOT EXISTS inventario (

    id_inventario INTEGER PRIMARY KEY AUTOINCREMENT,

    id_producto INTEGER,
    id_variante INTEGER,

    sucursal TEXT,

    stock INTEGER

)

`).run();

db.prepare(`

CREATE TABLE IF NOT EXISTS plataformas (

    id_plataforma INTEGER PRIMARY KEY AUTOINCREMENT,

    id_producto INTEGER,

    mercado_libre INTEGER DEFAULT 0,
    tiktok INTEGER DEFAULT 0,
    web INTEGER DEFAULT 0

)

`).run();

// ======================
// PAGINA PRINCIPAL
// ======================

app.get('/', (req, res) => {

    res.sendFile(
        __dirname +
        '/public/productos/index.html'
    );

});

// ======================
// PRODUCTOS
// ======================

app.post(
    '/api/productos',
    upload.single('imagen'),
    (req, res) => {

        try {

            const {
                codigo,
                nombre,
                marca,
                categoria,
                genero,
                precio
            } = req.body;

            const imagen =
                req.file
                ? req.file.filename
                : '';

            db.prepare(`

                INSERT INTO productos (

                    codigo,
                    nombre,
                    marca,
                    categoria,
                    genero,
                    precio,
                    imagen

                )

                VALUES (?, ?, ?, ?, ?, ?, ?)

            `).run(

                codigo,
                nombre,
                marca,
                categoria,
                genero,
                precio,
                imagen

            );

            res.json({
                mensaje:
                    'Producto guardado correctamente'
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                mensaje:
                    'Error al guardar producto'
            });

        }

    }
);

app.get('/api/productos', (req, res) => {

    try {

        const productos = db.prepare(`

            SELECT *
            FROM productos
            ORDER BY id_producto DESC

        `).all();

        res.json(productos);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al obtener productos'
        });

    }

});

app.put(
    '/api/productos/:id',
    upload.single('imagen'),
    (req, res) => {

        try {

            const id =
                req.params.id;

            const {
                codigo,
                nombre,
                marca,
                categoria,
                genero,
                precio
            } = req.body;

            const producto = db.prepare(`

                SELECT *
                FROM productos
                WHERE id_producto = ?

            `).get(id);

            if (!producto) {

                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });

            }

            let imagen =
                producto.imagen;

            if (req.file) {

                imagen =
                    req.file.filename;

            }

            db.prepare(`

                UPDATE productos

                SET

                    codigo = ?,
                    nombre = ?,
                    marca = ?,
                    categoria = ?,
                    genero = ?,
                    precio = ?,
                    imagen = ?

                WHERE id_producto = ?

            `).run(

                codigo,
                nombre,
                marca,
                categoria,
                genero,
                precio,
                imagen,
                id

            );

            res.json({
                mensaje:
                    'Producto actualizado'
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                mensaje:
                    'Error al editar producto'
            });

        }

    }
);

app.delete('/api/productos/:id', (req, res) => {

    try {

        const id =
            req.params.id;

        db.prepare(`
            DELETE FROM productos
            WHERE id_producto = ?
        `).run(id);

        res.json({
            mensaje:
                'Producto eliminado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al eliminar producto'
        });

    }

});

// ======================
// BUSCAR PRODUCTO POR CODIGO
// ======================

app.get('/api/producto/codigo/:codigo', (req, res) => {

    try {

        const codigo = req.params.codigo;

        const producto = db.prepare(`
            SELECT *
            FROM productos
            WHERE codigo = ?
        `).get(codigo);

        if (!producto) {

            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });

        }

        res.json(producto);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al buscar producto'
        });

    }

});



// ======================
// VARIANTES
// ======================

app.post('/api/variantes', (req, res) => {

    try {

        const {
            id_producto,
            color,
            talla
        } = req.body;

        db.prepare(`

            INSERT INTO variantes (

                id_producto,
                color,
                talla

            )

            VALUES (?, ?, ?)

        `).run(

            id_producto,
            color,
            talla

        );

        res.json({
            mensaje:
                'Variante guardada'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al guardar variante'
        });

    }

});

app.get('/api/variantes', (req, res) => {

    try {

        const variantes = db.prepare(`

            SELECT

                variantes.id_variante,
                variantes.color,
                variantes.talla,

                productos.id_producto,
                productos.codigo,
                productos.nombre,
                productos.imagen

            FROM variantes

            LEFT JOIN productos
            ON variantes.id_producto =
            productos.id_producto

            ORDER BY variantes.id_variante DESC

        `).all();

        res.json(variantes);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al obtener variantes'
        });

    }

});

// ======================
// SUCURSALES
// ======================

app.post('/api/sucursales', (req, res) => {

    try {

        const {
            id_producto,
            id_variante,
            sucursal
        } = req.body;

        db.prepare(`

            INSERT INTO sucursales (

                id_producto,
                id_variante,
                sucursal

            )

            VALUES (?, ?, ?)

        `).run(

            id_producto,
            id_variante,
            sucursal

        );

        res.json({
            mensaje:
                'Sucursal guardada'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al guardar sucursal'
        });

    }

});

app.get('/api/sucursales', (req, res) => {

    try {

        const sucursales = db.prepare(`

            SELECT

                sucursales.id_sucursal,
                sucursales.id_producto,
                sucursales.id_variante,
                sucursales.sucursal,

                productos.nombre,
                productos.imagen,

                variantes.color,
                variantes.talla

            FROM sucursales

            LEFT JOIN productos
            ON sucursales.id_producto =
            productos.id_producto

            LEFT JOIN variantes
            ON sucursales.id_variante =
            variantes.id_variante

            ORDER BY sucursales.id_sucursal DESC

        `).all();

        res.json(sucursales);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al obtener sucursales'
        });

    }

});

app.put('/api/sucursales/:id', (req, res) => {

    try {

        const id =
            req.params.id;

        const {
            id_producto,
            id_variante,
            sucursal
        } = req.body;

        db.prepare(`

            UPDATE sucursales

            SET

                id_producto = ?,
                id_variante = ?,
                sucursal = ?

            WHERE id_sucursal = ?

        `).run(

            id_producto,
            id_variante,
            sucursal,
            id

        );

        res.json({
            mensaje:
                'Sucursal actualizada'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al editar sucursal'
        });

    }

});

app.delete('/api/sucursales/:id', (req, res) => {

    try {

        const id =
            req.params.id;

        db.prepare(`

            DELETE FROM sucursales
            WHERE id_sucursal = ?

        `).run(id);

        res.json({
            mensaje:
                'Sucursal eliminada'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al eliminar sucursal'
        });

    }

});

// ======================
// PLATAFORMAS
// ======================

// GUARDAR / ACTUALIZAR
app.post('/api/plataformas', (req, res) => {

    try {

        const {
            id_producto,
            mercado_libre,
            tiktok,
            web
        } = req.body;

        // VER si ya existe
        const existe = db.prepare(`
            SELECT *
            FROM plataformas
            WHERE id_producto = ?
        `).get(id_producto);

        if (existe) {

            db.prepare(`

                UPDATE plataformas
                SET
                    mercado_libre = ?,
                    tiktok = ?,
                    web = ?
                WHERE id_producto = ?

            `).run(
                mercado_libre,
                tiktok,
                web,
                id_producto
            );

        } else {

            db.prepare(`

                INSERT INTO plataformas (
                    id_producto,
                    mercado_libre,
                    tiktok,
                    web
                )
                VALUES (?, ?, ?, ?)

            `).run(
                id_producto,
                mercado_libre,
                tiktok,
                web
            );

        }

        res.json({
            mensaje: 'Plataformas guardadas'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al guardar plataformas'
        });

    }

});


// OBTENER LISTA
app.get('/api/plataformas', (req, res) => {

    try {

        const data = db.prepare(`

            SELECT
                plataformas.id_producto,
                plataformas.mercado_libre,
                plataformas.tiktok,
                plataformas.web,

                productos.codigo,
                productos.nombre,
                productos.imagen

            FROM plataformas

            LEFT JOIN productos
            ON plataformas.id_producto = productos.id_producto

            ORDER BY plataformas.id_plataforma DESC

        `).all();

        res.json(data);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al obtener plataformas'
        });

    }

});


// ELIMINAR
app.delete('/api/plataformas/:id', (req, res) => {

    try {

        const id = req.params.id;

        db.prepare(`
            DELETE FROM plataformas
            WHERE id_producto = ?
        `).run(id);

        res.json({
            mensaje: 'Eliminado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al eliminar'
        });

    }

});

// ======================
// INVENTARIO
// ======================

// CREAR
app.post('/api/inventario', (req, res) => {

    try {

        const {
            id_producto,
            id_variante,
            sucursal,
            stock
        } = req.body;

        db.prepare(`
            INSERT INTO inventario (
                id_producto,
                id_variante,
                sucursal,
                stock
            )
            VALUES (?, ?, ?, ?)
        `).run(
            id_producto,
            id_variante,
            sucursal,
            stock
        );

        res.json({
            mensaje: 'Inventario guardado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al guardar inventario'
        });

    }

});


// OBTENER
app.get('/api/inventario', (req, res) => {

    try {

        const data = db.prepare(`

            SELECT

                inventario.id_inventario,
                inventario.stock,
                inventario.sucursal,

                productos.id_producto,
                productos.nombre,
                productos.categoria,
                productos.imagen,

                variantes.id_variante,
                variantes.color,
                variantes.talla,

                plataformas.mercado_libre,
                plataformas.tiktok,
                plataformas.web

            FROM inventario

            LEFT JOIN productos
            ON inventario.id_producto =
            productos.id_producto

            LEFT JOIN variantes
            ON inventario.id_variante =
            variantes.id_variante

            LEFT JOIN plataformas
            ON inventario.id_producto =
            plataformas.id_producto

            ORDER BY inventario.id_inventario DESC

        `).all();

        res.json(data);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al obtener inventario'
        });

    }

});


// ACTUALIZAR STOCK GENERAL (EDITAR FORM)
app.put('/api/inventario/:id', (req, res) => {

    try {

        const id = req.params.id;

        const {
            id_producto,
            id_variante,
            sucursal,
            stock
        } = req.body;

        db.prepare(`
            UPDATE inventario
            SET
                id_producto = ?,
                id_variante = ?,
                sucursal = ?,
                stock = ?
            WHERE id_inventario = ?
        `).run(
            id_producto,
            id_variante,
            sucursal,
            stock,
            id
        );

        res.json({
            mensaje: 'Inventario actualizado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al actualizar inventario'
        });

    }

});


// ELIMINAR
app.delete('/api/inventario/:id', (req, res) => {

    try {

        const id = req.params.id;

        db.prepare(`
            DELETE FROM inventario
            WHERE id_inventario = ?
        `).run(id);

        res.json({
            mensaje: 'Inventario eliminado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al eliminar inventario'
        });

    }

});


// AGREGAR STOCK
app.put('/api/inventario/agregar/:id', (req, res) => {

    try {

        const id = req.params.id;
        const { cantidad } = req.body;

        db.prepare(`
            UPDATE inventario
            SET stock = stock + ?
            WHERE id_inventario = ?
        `).run(cantidad, id);

        res.json({
            mensaje: 'Stock agregado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al agregar stock'
        });

    }

});


// QUITAR STOCK
app.put('/api/inventario/quitar/:id', (req, res) => {

    try {

        const id = req.params.id;
        const { cantidad } = req.body;

        db.prepare(`
            UPDATE inventario
            SET stock = stock - ?
            WHERE id_inventario = ?
        `).run(cantidad, id);

        res.json({
            mensaje: 'Stock descontado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al quitar stock'
        });

    }

});

// ======================
// SERVIDOR
// ======================

app.listen(3000, () => {

    console.log(
        'Servidor corriendo en puerto 3000'
    );

});