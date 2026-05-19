// ======================
// BUSCAR PRODUCTO
// ======================

async function buscarProducto(){

    const codigo =
        document.getElementById('codigoProducto').value;

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
// GUARDAR / EDITAR
// ======================

async function guardarSucursal(){

    const idSucursal =
        document.getElementById('idSucursal').value;

    const datos = {

        id_producto:
            document.getElementById('idProducto').value,

        id_variante:
            document.getElementById('variante').value,

        sucursal:
            document.getElementById('sucursal').value

    };

    let url =
        '/api/sucursales';

    let metodo =
        'POST';

    if(idSucursal){

        url =
            '/api/sucursales/' + idSucursal;

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

    limpiarFormulario();

    cargarSucursales();

}

// ======================
// CARGAR SUCURSALES
// ======================

async function cargarSucursales(){

    const respuesta =
        await fetch('/api/sucursales');

    const sucursales =
        await respuesta.json();

    const lista =
        document.getElementById('lista');

    lista.innerHTML = '';

    sucursales.forEach(sucursal => {

        lista.innerHTML += `

        <tr>

            <td>${sucursal.id_sucursal}</td>

            <td>

                <img
                    src="/uploads/${sucursal.imagen}"
                >

            </td>

            <td>${sucursal.nombre}</td>

            <td>

                ${sucursal.color}
                -
                ${sucursal.talla}

            </td>

            <td>${sucursal.sucursal}</td>

            <td>

                <button
                    class="btn-editar"
                    onclick="editarSucursal(${sucursal.id_sucursal})"
                >
                    Editar
                </button>

                <button
                    class="btn-eliminar"
                    onclick="eliminarSucursal(${sucursal.id_sucursal})"
                >
                    Eliminar
                </button>

            </td>

        </tr>

        `;

    });

}

// ======================
// EDITAR
// ======================

async function editarSucursal(id){

    const respuesta =
        await fetch('/api/sucursales');

    const sucursales =
        await respuesta.json();

    const sucursal =
        sucursales.find(s => s.id_sucursal == id);

    if(!sucursal) return;

    document.getElementById('idSucursal').value =
        sucursal.id_sucursal;

    document.getElementById('nombreProducto').value =
        sucursal.nombre;

    document.getElementById('idProducto').value =
        sucursal.id_producto;

    document.getElementById('imagenProducto').src =
        '/uploads/' + sucursal.imagen;

    document.getElementById('imagenProducto').style.display =
        'block';

    await cargarVariantes(sucursal.id_producto);

    document.getElementById('variante').value =
        sucursal.id_variante;

    document.getElementById('sucursal').value =
        sucursal.sucursal;

}

// ======================
// ELIMINAR
// ======================

async function eliminarSucursal(id){

    const confirmar =
        confirm('¿Deseas eliminar esta sucursal?');

    if(!confirmar) return;

    const respuesta =
        await fetch('/api/sucursales/' + id, {

            method: 'DELETE'

        });

    const data =
        await respuesta.json();

    alert(data.mensaje);

    cargarSucursales();

}

// ======================
// LIMPIAR
// ======================

function limpiarFormulario(){

    document.getElementById('idSucursal').value = '';

    document.getElementById('codigoProducto').value = '';

    document.getElementById('nombreProducto').value = '';

    document.getElementById('idProducto').value = '';

    document.getElementById('variante').innerHTML = `
        <option value="">
            Selecciona Variante
        </option>
    `;

    document.getElementById('sucursal').value = '';

    document.getElementById('imagenProducto').style.display =
        'none';

}

cargarSucursales();