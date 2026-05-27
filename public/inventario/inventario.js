// ======================
// BUSCAR PRODUCTO
// ======================

async function buscarProducto(){

    const codigo =
        document.getElementById('codigoProducto').value;

    if(!codigo){

        limpiarFormulario();

        return;

    }

    const respuesta =
        await fetch('/api/productos');

    const productos =
        await respuesta.json();

    const producto =
        productos.find(p => p.codigo == codigo);

    if(producto){

        document.getElementById('idProducto').value =
            producto.id_producto;

        document.getElementById('nombreProducto').value =
            producto.nombre;

        document.getElementById('imagenProducto').src =
            '/uploads/' + producto.imagen;

        document.getElementById('imagenProducto').style.display =
            'block';

        cargarVariantes(producto.id_producto);

        cargarSucursales(producto.id_producto);

    }else{

        document.getElementById('nombreProducto').value =
            'Producto no encontrado';

        document.getElementById('imagenProducto').style.display =
            'none';

    }

}

// ======================
// CARGAR VARIANTES
// ======================

async function cargarVariantes(idProducto){

    const respuesta =
        await fetch('/api/variantes');

    const variantes =
        await respuesta.json();

    const select =
        document.getElementById('variante');

    select.innerHTML = `
        <option value="">
            Selecciona Variante
        </option>
    `;

    variantes
    .filter(v => v.id_producto == idProducto)
    .forEach(variante => {

        select.innerHTML += `

        <option value="${variante.id_variante}">

            ${variante.color} - ${variante.talla}

        </option>

        `;

    });

}

// ======================
// CARGAR SUCURSALES
// ======================

async function cargarSucursales(idProducto){

    const respuesta =
        await fetch('/api/sucursales');

    const sucursales =
        await respuesta.json();

    const select =
        document.getElementById('sucursal');

    select.innerHTML = `
        <option value="">
            Selecciona Sucursal
        </option>
    `;

    sucursales
    .filter(s => s.id_producto == idProducto)
    .forEach(sucursal => {

        select.innerHTML += `

        <option value="${sucursal.sucursal}">

            ${sucursal.sucursal}

        </option>

        `;

    });

}

// ======================
// GUARDAR INVENTARIO
// ======================

async function guardarInventario(){

    const datos = {

        id_producto:
            document.getElementById('idProducto').value,

        id_variante:
            document.getElementById('variante').value,

        sucursal:
            document.getElementById('sucursal').value,

        stock:
            document.getElementById('stock').value

    };

    const idInventario =
        document.getElementById('idInventario').value;

    let url =
        '/api/inventario';

    let metodo =
        'POST';

    if(idInventario){

        url =
            '/api/inventario/' + idInventario;

        metodo =
            'PUT';

    }

    const respuesta =
        await fetch(url, {

            method: metodo,

            headers: {
                'Content-Type':
                    'application/json'
            },

            body:
                JSON.stringify(datos)

        });

    const data =
        await respuesta.json();

    alert(data.mensaje);

    cargarInventario();

    limpiarFormulario();

}

// ======================
// CARGAR INVENTARIO
// ======================

async function cargarInventario(){

    const respuesta =
        await fetch('/api/inventario');

    const inventario =
        await respuesta.json();

    const lista =
        document.getElementById('lista');

    lista.innerHTML = '';

    inventario.forEach(item => {

        lista.innerHTML += `

        <tr>

            <td>${item.id_inventario}</td>

            <td>

                <img
                    src="/uploads/${item.imagen}"
                >

            </td>

            <td>${item.nombre}</td>

            <td>

                ${item.color}
                -
                ${item.talla}

            </td>

            <td>${item.sucursal}</td>

            <td>${item.stock}</td>

            <td>

                <input
                    type="number"
                    id="agregar-${item.id_inventario}"
                    placeholder="Cantidad"
                    style="width:90px;"
                >

                <button
                    onclick="agregarStock(${item.id_inventario})"
                >
                    +
                </button>

            </td>

            <td>

                <input
                    type="number"
                    id="quitar-${item.id_inventario}"
                    placeholder="Cantidad"
                    style="width:90px;"
                >

                <button
                    style="background:red;"
                    onclick="quitarStock(${item.id_inventario})"
                >
                    -
                </button>

            </td>

            <td>

                <button
                    onclick="editarInventario(${item.id_inventario})"
                >
                    Editar
                </button>

                <button
                    style="background:red;"
                    onclick="eliminarInventario(${item.id_inventario})"
                >
                    Eliminar
                </button>

            </td>

        </tr>

        `;

    });

}

// ======================
// AGREGAR STOCK
// ======================

async function agregarStock(id){

    const cantidad =
        document.getElementById(`agregar-${id}`).value;

    if(!cantidad || cantidad <= 0){

        alert('Ingresa cantidad');

        return;

    }

    const respuesta =
        await fetch(`/api/inventario/agregar/${id}`, {

            method: 'PUT',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                cantidad
            })

        });

    const data =
        await respuesta.json();

    alert(data.mensaje);

    cargarInventario();

}

// ======================
// QUITAR STOCK
// ======================

async function quitarStock(id){

    const cantidad =
        document.getElementById(`quitar-${id}`).value;

    if(!cantidad || cantidad <= 0){

        alert('Ingresa cantidad');

        return;

    }

    const respuesta =
        await fetch(`/api/inventario/quitar/${id}`, {

            method: 'PUT',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                cantidad
            })

        });

    const data =
        await respuesta.json();

    alert(data.mensaje);

    cargarInventario();

}

// ======================
// EDITAR
// ======================

async function editarInventario(id){

    try {

        const respuesta =
            await fetch('/api/inventario');

        const inventario =
            await respuesta.json();

        const item =
            inventario.find(i =>
                i.id_inventario == id
            );

        if(!item){

            alert('Inventario no encontrado');

            return;

        }

        // llenar datos
        document.getElementById('idInventario').value =
            item.id_inventario;

        document.getElementById('idProducto').value =
            item.id_producto;

        document.getElementById('nombreProducto').value =
            item.nombre;

        document.getElementById('stock').value =
            item.stock;

        // imagen
        const imagen =
            document.getElementById('imagenProducto');

        imagen.src =
            '/uploads/' + item.imagen;

        imagen.style.display =
            'block';

        // cargar variantes
        await cargarVariantes(item.id_producto);

        setTimeout(() => {

            document.getElementById('variante').value =
                item.id_variante;

        }, 100);

        // cargar sucursales
        await cargarSucursales(item.id_producto);

        setTimeout(() => {

            document.getElementById('sucursal').value =
                item.sucursal;

        }, 100);

        // subir arriba
        window.scrollTo({

            top: 0,
            behavior: 'smooth'

        });

    } catch(error){

        console.log(error);

        alert('Error al editar inventario');

    }

}

// ======================
// ELIMINAR
// ======================

async function eliminarInventario(id){

    const confirmar =
        confirm('¿Eliminar inventario?');

    if(!confirmar) return;

    const respuesta =
        await fetch('/api/inventario/' + id, {

            method: 'DELETE'

        });

    const data =
        await respuesta.json();

    alert(data.mensaje);

    cargarInventario();

}

// ======================
// LIMPIAR
// ======================

function limpiarFormulario(){

    document.getElementById('codigoProducto').value = '';

    document.getElementById('nombreProducto').value = '';

    document.getElementById('idProducto').value = '';

    document.getElementById('idInventario').value = '';

    document.getElementById('stock').value = '';

    document.getElementById('imagenProducto').style.display =
        'none';

}

cargarInventario();