let idEditando = null;

// ======================
// BUSCAR PRODUCTO
// ======================

async function buscarProducto(){

    const codigo =
        document.getElementById('codigoProducto').value;

    if(codigo == ''){

        document.getElementById('nombreProducto').value = '';

        document.getElementById('imagenProducto').style.display =
            'none';

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

    }else{

        document.getElementById('idProducto').value = '';

        document.getElementById('nombreProducto').value =
            'Producto no encontrado';

        document.getElementById('imagenProducto').style.display =
            'none';

    }

}

// ======================
// GUARDAR O EDITAR
// ======================

async function guardarVariante(){

    const datos = {

        id_producto:
            document.getElementById('idProducto').value,

        color:
            document.getElementById('color').value,

        talla:
            document.getElementById('talla').value

    };

    if(datos.id_producto == ''){

        alert('Producto no encontrado');

        return;

    }

    let url =
        '/api/variantes';

    let metodo =
        'POST';

    // ======================
    // EDITAR
    // ======================

    if(idEditando){

        url =
            '/api/variantes/' + idEditando;

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

    cargarVariantes();

}

// ======================
// LIMPIAR
// ======================

function limpiarFormulario(){

    idEditando = null;

    document.getElementById('codigoProducto').value = '';
    document.getElementById('nombreProducto').value = '';
    document.getElementById('idProducto').value = '';
    document.getElementById('color').value = '';
    document.getElementById('talla').value = '';

    document.getElementById('imagenProducto').style.display =
        'none';

}

// ======================
// CARGAR VARIANTES
// ======================

async function cargarVariantes(){

    const respuesta =
        await fetch('/api/variantes');

    const variantes =
        await respuesta.json();

    const lista =
        document.getElementById('lista');

    lista.innerHTML = '';

    variantes.forEach(variante => {

        lista.innerHTML += `

        <tr>

            <td>${variante.id_variante}</td>

            <td>${variante.id_producto}</td>

            <td>

                <img
                    src="/uploads/${variante.imagen}"
                >

            </td>

            <td>

                ${variante.codigo}

                <br><br>

                ${variante.nombre}

            </td>

            <td>${variante.color}</td>

            <td>${variante.talla}</td>

            <td>

                <button

                    onclick="editarVariante(

                        ${variante.id_variante},

                        '${variante.codigo}',

                        '${variante.nombre}',

                        '${variante.imagen}',

                        '${variante.id_producto}',

                        '${variante.color}',

                        '${variante.talla}'

                    )"

                    style="
                        background:orange;
                        color:white;
                        border:none;
                        padding:8px 12px;
                        cursor:pointer;
                        border-radius:5px;
                        margin-right:5px;
                    "
                >

                    Editar

                </button>

                <button

                    onclick="eliminarVariante(${variante.id_variante})"

                    style="
                        background:red;
                        color:white;
                        border:none;
                        padding:8px 12px;
                        cursor:pointer;
                        border-radius:5px;
                    "
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

function editarVariante(

    id_variante,
    codigo,
    nombre,
    imagen,
    id_producto,
    color,
    talla

){

    idEditando =
        id_variante;

    document.getElementById('codigoProducto').value =
        codigo;

    document.getElementById('nombreProducto').value =
        nombre;

    document.getElementById('idProducto').value =
        id_producto;

    document.getElementById('color').value =
        color;

    document.getElementById('talla').value =
        talla;

    document.getElementById('imagenProducto').src =
        '/uploads/' + imagen;

    document.getElementById('imagenProducto').style.display =
        'block';

    window.scrollTo({

        top: 0,
        behavior: 'smooth'

    });

}

// ======================
// ELIMINAR
// ======================

async function eliminarVariante(id){

    const confirmar =
        confirm('¿Eliminar variante?');

    if(!confirmar) return;

    const respuesta =
        await fetch('/api/variantes/' + id, {

            method: 'DELETE'

        });

    const data =
        await respuesta.json();

    alert(data.mensaje);

    cargarVariantes();

}

cargarVariantes();