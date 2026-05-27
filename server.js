require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ======================
// CREAR CARPETA UPLOADS (IMPORTANTE)
// ======================

const uploadDir = 'public/uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ======================
// POSTGRESQL
// ======================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

// ======================
// MIDDLEWARES
// ======================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// SOLO ESTA LÍNEA (la correcta)
app.use('/uploads', express.static('public/uploads'));


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
// CREAR TABLAS
// ======================

async function crearTablas() {

    try {

        await pool.query(`

            CREATE TABLE IF NOT EXISTS productos (

                id_producto SERIAL PRIMARY KEY,

                codigo TEXT,
                nombre TEXT,
                marca TEXT,
                categoria TEXT,
                genero TEXT,
                precio REAL,
                imagen TEXT

            )

        `);

        await pool.query(`

            CREATE TABLE IF NOT EXISTS variantes (

                id_variante SERIAL PRIMARY KEY,

                id_producto INTEGER,

                color TEXT,
                talla TEXT

            )

        `);

        await pool.query(`

            CREATE TABLE IF NOT EXISTS sucursales (

                id_sucursal SERIAL PRIMARY KEY,

                id_producto INTEGER,
                id_variante INTEGER,

                sucursal TEXT

            )

        `);

        await pool.query(`

            CREATE TABLE IF NOT EXISTS inventario (

                id_inventario SERIAL PRIMARY KEY,

                id_producto INTEGER,
                id_variante INTEGER,

                sucursal TEXT,

                stock INTEGER

            )

        `);

        await pool.query(`

            CREATE TABLE IF NOT EXISTS plataformas (

                id_plataforma SERIAL PRIMARY KEY,

                id_producto INTEGER,

                mercado_libre INTEGER DEFAULT 0,
                tiktok INTEGER DEFAULT 0,
                web INTEGER DEFAULT 0

            )

        `);

        console.log(
            'Tablas PostgreSQL listas'
        );

    } catch (error) {

        console.log(error);

    }

}

crearTablas();

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
    async (req, res) => {

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

            await pool.query(`

                INSERT INTO productos (

                    codigo,
                    nombre,
                    marca,
                    categoria,
                    genero,
                    precio,
                    imagen

                )

                VALUES ($1, $2, $3, $4, $5, $6, $7)

            `,
            [
                codigo,
                nombre,
                marca,
                categoria,
                genero,
                precio,
                imagen
            ]);

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

app.get('/api/productos', async (req, res) => {

    try {

        const productos = await pool.query(`

            SELECT *
            FROM productos
            ORDER BY id_producto DESC

        `);

        res.json(productos.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al obtener productos'
        });

    }

});

app.get('/api/producto/codigo/:codigo', async (req, res) => {

    try {

        const codigo =
            req.params.codigo;

        const producto =
            await pool.query(`

                SELECT *
                FROM productos
                WHERE codigo = $1

            `,
            [codigo]);

        if (
            producto.rows.length === 0
        ) {

            return res.status(404).json({
                mensaje:
                    'Producto no encontrado'
            });

        }

        res.json(
            producto.rows[0]
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al buscar producto'
        });

    }

});

app.put(
    '/api/productos/:id',
    upload.single('imagen'),
    async (req, res) => {

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

            const producto =
                await pool.query(`

                    SELECT *
                    FROM productos
                    WHERE id_producto = $1

                `,
                [id]);

            if (
                producto.rows.length === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        'Producto no encontrado'
                });

            }

            let imagen =
                producto.rows[0].imagen;

            if (req.file) {

                imagen =
                    req.file.filename;

            }

            await pool.query(`

                UPDATE productos

                SET

                    codigo = $1,
                    nombre = $2,
                    marca = $3,
                    categoria = $4,
                    genero = $5,
                    precio = $6,
                    imagen = $7

                WHERE id_producto = $8

            `,
            [
                codigo,
                nombre,
                marca,
                categoria,
                genero,
                precio,
                imagen,
                id
            ]);

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

app.delete('/api/productos/:id', async (req, res) => {

    const client = await pool.connect();

    try {

        const id = req.params.id;

        await client.query('BEGIN');

        // 1. borrar inventario
        await client.query(`
            DELETE FROM inventario
            WHERE id_producto = $1
        `, [id]);

        // 2. borrar sucursales
        await client.query(`
            DELETE FROM sucursales
            WHERE id_producto = $1
        `, [id]);

        // 3. borrar variantes
        await client.query(`
            DELETE FROM variantes
            WHERE id_producto = $1
        `, [id]);

        // 4. borrar plataformas
        await client.query(`
            DELETE FROM plataformas
            WHERE id_producto = $1
        `, [id]);

        // 5. borrar producto
        await client.query(`
            DELETE FROM productos
            WHERE id_producto = $1
        `, [id]);

        await client.query('COMMIT');

        res.json({
            mensaje: 'Producto eliminado en todas las tablas'
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al eliminar producto'
        });

    } finally {
        client.release();
    }

});

// ======================
// VARIANTES
// ======================

app.post('/api/variantes', async (req, res) => {

    try {

        const {
            id_producto,
            color,
            talla
        } = req.body;

        await pool.query(`

            INSERT INTO variantes (

                id_producto,
                color,
                talla

            )

            VALUES ($1, $2, $3)

        `,
        [
            id_producto,
            color,
            talla
        ]);

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

app.get('/api/variantes', async (req, res) => {

    try {

        const variantes =
            await pool.query(`

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

            `);

        res.json(
            variantes.rows
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al obtener variantes'
        });

    }

});
app.delete('/api/variantes/:id', async (req, res) => {

    try {

        const id = req.params.id;

        await pool.query(`

            DELETE FROM variantes
            WHERE id_variante = $1

        `, [id]);

        res.json({
            mensaje: 'Variante eliminada'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al eliminar variante'
        });

    }

});
// ======================
// SUCURSALES
// ======================

app.post('/api/sucursales', async (req, res) => {

    try {

        const {
            id_producto,
            id_variante,
            sucursal
        } = req.body;

        await pool.query(`

            INSERT INTO sucursales (

                id_producto,
                id_variante,
                sucursal

            )

            VALUES ($1, $2, $3)

        `,
        [
            id_producto,
            id_variante,
            sucursal
        ]);

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

app.get('/api/sucursales', async (req, res) => {

    try {

        const sucursales =
            await pool.query(`

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

            `);

        res.json(
            sucursales.rows
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al obtener sucursales'
        });

    }

});

// ELIMINAR SUCURSAL
app.delete('/api/sucursales/:id', async (req, res) => {

    try {

        const id = req.params.id;

        await pool.query(`

            DELETE FROM sucursales
            WHERE id_sucursal = $1

        `, [id]);

        res.json({
            mensaje: 'Sucursal eliminada'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al eliminar sucursal'
        });

    }

});

// ======================
// PLATAFORMAS
// ======================

// GUARDAR
app.post('/api/plataformas', async (req, res) => {

    try {

        const {
            id_producto,
            mercado_libre,
            tiktok,
            web
        } = req.body;

        // validar producto
        const producto = await pool.query(`

            SELECT *
            FROM productos
            WHERE id_producto = $1

        `, [id_producto]);

        if(producto.rows.length === 0){

            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });

        }

        // revisar si ya existe
        const existe = await pool.query(`

            SELECT *
            FROM plataformas
            WHERE id_producto = $1

        `, [id_producto]);

        // actualizar
        if(existe.rows.length > 0){

            await pool.query(`

                UPDATE plataformas

                SET
                    mercado_libre = $1,
                    tiktok = $2,
                    web = $3

                WHERE id_producto = $4

            `,
            [
                mercado_libre,
                tiktok,
                web,
                id_producto
            ]);

        }

        // insertar
        else {

            await pool.query(`

                INSERT INTO plataformas (

                    id_producto,
                    mercado_libre,
                    tiktok,
                    web

                )

                VALUES ($1, $2, $3, $4)

            `,
            [
                id_producto,
                mercado_libre,
                tiktok,
                web
            ]);

        }

        // devolver datos actualizados
        const plataformas = await pool.query(`

            SELECT

                plataformas.id_plataforma,

                plataformas.mercado_libre,
                plataformas.tiktok,
                plataformas.web,

                productos.id_producto,
                productos.codigo,
                productos.nombre,
                productos.imagen

            FROM plataformas

            INNER JOIN productos
            ON plataformas.id_producto =
            productos.id_producto

            ORDER BY plataformas.id_plataforma DESC

        `);

        res.json({
            mensaje: 'Plataformas guardadas',
            data: plataformas.rows
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al guardar plataformas'
        });

    }

});

// OBTENER
app.get('/api/plataformas', async (req, res) => {

    try {

        const plataformas = await pool.query(`

            SELECT

                plataformas.id_plataforma,

                plataformas.mercado_libre,
                plataformas.tiktok,
                plataformas.web,

                productos.id_producto,
                productos.codigo,
                productos.nombre,
                productos.imagen

            FROM plataformas

            INNER JOIN productos
            ON plataformas.id_producto =
            productos.id_producto

            ORDER BY plataformas.id_plataforma DESC

        `);

        res.json(plataformas.rows);

    } catch(error){

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al obtener plataformas'
        });

    }

});

// ELIMINAR
app.delete('/api/plataformas/:id', async (req, res) => {

    try {

        const id = req.params.id;

        await pool.query(`

            DELETE FROM plataformas
            WHERE id_producto = $1

        `, [id]);

        res.json({
            mensaje: 'Plataforma eliminada'
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al eliminar plataforma'
        });

    }

});

// ======================
// INVENTARIO
// ======================

// GUARDAR INVENTARIO
app.post('/api/inventario', async (req, res) => {

    try {

        const {
            id_producto,
            id_variante,
            sucursal,
            stock
        } = req.body;

        // validar si ya existe
        const existe = await pool.query(`

            SELECT *
            FROM inventario
            WHERE id_producto = $1
            AND id_variante = $2
            AND sucursal = $3

        `,
        [
            id_producto,
            id_variante,
            sucursal
        ]);

        if(existe.rows.length > 0){

            return res.status(400).json({
                mensaje:
                    'Ese inventario ya existe'
            });

        }

        await pool.query(`

            INSERT INTO inventario (

                id_producto,
                id_variante,
                sucursal,
                stock

            )

            VALUES ($1, $2, $3, $4)

        `,
        [
            id_producto,
            id_variante,
            sucursal,
            stock || 0
        ]);

        res.json({
            mensaje:
                'Inventario guardado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al guardar inventario'
        });

    }

});

// OBTENER INVENTARIO
// OBTENER INVENTARIO
app.get('/api/inventario', async (req, res) => {

    try {

        const inventario =
            await pool.query(`

                SELECT

                    inventario.id_inventario,
                    inventario.stock,
                    inventario.sucursal,

                    productos.id_producto,
                    productos.nombre,
                    productos.categoria,
                    productos.genero,
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

            `);

        res.json(
            inventario.rows
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al obtener inventario'
        });

    }

});

// EDITAR INVENTARIO
app.put('/api/inventario/:id', async (req, res) => {

    try {

        const id =
            req.params.id;

        const {
            id_producto,
            id_variante,
            sucursal,
            stock
        } = req.body;

        await pool.query(`

            UPDATE inventario

            SET

                id_producto = $1,
                id_variante = $2,
                sucursal = $3,
                stock = $4

            WHERE id_inventario = $5

        `,
        [
            id_producto,
            id_variante,
            sucursal,
            stock,
            id
        ]);

        res.json({
            mensaje:
                'Inventario actualizado'
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al actualizar inventario'
        });

    }

});

// ELIMINAR INVENTARIO
app.delete('/api/inventario/:id', async (req, res) => {

    try {

        const id =
            req.params.id;

        await pool.query(`

            DELETE FROM inventario
            WHERE id_inventario = $1

        `,
        [id]);

        res.json({
            mensaje:
                'Inventario eliminado'
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al eliminar inventario'
        });

    }

});

// AGREGAR STOCK
app.put('/api/inventario/agregar/:id', async (req, res) => {

    try {

        const id =
            req.params.id;

        const {
            cantidad
        } = req.body;

        await pool.query(`

            UPDATE inventario

            SET stock = stock + $1

            WHERE id_inventario = $2

        `,
        [
            cantidad,
            id
        ]);

        res.json({
            mensaje:
                'Stock agregado'
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al agregar stock'
        });

    }

});

// QUITAR STOCK
app.put('/api/inventario/quitar/:id', async (req, res) => {

    try {

        const id =
            req.params.id;

        const {
            cantidad
        } = req.body;

        // obtener stock actual
        const inventario =
            await pool.query(`

                SELECT stock
                FROM inventario
                WHERE id_inventario = $1

            `,
            [id]);

        if(inventario.rows.length === 0){

            return res.status(404).json({
                mensaje:
                    'Inventario no encontrado'
            });

        }

        const stockActual =
            inventario.rows[0].stock;

        if(stockActual < cantidad){

            return res.status(400).json({
                mensaje:
                    'No hay suficiente stock'
            });

        }

        await pool.query(`

            UPDATE inventario

            SET stock = stock - $1

            WHERE id_inventario = $2

        `,
        [
            cantidad,
            id
        ]);

        res.json({
            mensaje:
                'Stock descontado'
        });

    } catch(error){

        console.log(error);

        res.status(500).json({
            mensaje:
                'Error al quitar stock'
        });

    }

});

// ======================
// SERVIDOR
// ======================

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Servidor corriendo en puerto ${PORT}`
    );

});