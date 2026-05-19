let idEditando = null;

// ======================
// GUARDAR O EDITAR
// ======================

async function guardarProducto() {

    const formData = new FormData();

    formData.append(
        'codigo',
        document.getElementById('codigo').value
    );

    formData.append(
        'nombre',
        document.getElementById('nombre').value
    );

    formData.append(
        'marca',
        document.getElementById('marca').value
    );

    formData.append(
        'categoria',
        document.getElementById('categoria').value
    );

    formData.append(
        'genero',
        document.getElementById('genero').value
    );

    formData.append(
        'precio',
        document.getElementById('precio').value
    );

    const imagen =
        document.getElementById('imagen').files[0];

    if(imagen){

        formData.append(
            'imagen',
            imagen
        );

    }

    let url =
        '/api/productos';

    let metodo =
        'POST';

    // ======================
    // EDITAR
    // ======================

    if(idEditando){

        url =
            '/api/productos/' + idEditando;

        metodo =
            'PUT';

    }

    const respuesta =
        await fetch(url, {

            method: metodo,

            body: formData

        });

    const data =
        await respuesta.json();

    alert(data.mensaje);

    limpiarFormulario();

    cargarProductos();

}

// ======================
// LIMPIAR FORMULARIO
// ======================

function limpiarFormulario(){

    idEditando = null;

    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('marca').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('genero').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('imagen').value = '';

}

// ======================
// CARGAR PRODUCTOS
// ======================

async function cargarProductos() {

    const respuesta =
        await fetch('/api/productos');

    const productos =
        await respuesta.json();

    const lista =
        document.getElementById('lista');

    lista.innerHTML = '';

    productos.forEach(producto => {

        lista.innerHTML += `

        <tr>

            <td>${producto.id_producto}</td>

            <td>${producto.codigo}</td>

            <td>${producto.nombre}</td>

            <td>${producto.marca}</td>

            <td>${producto.categoria}</td>

            <td>${producto.genero}</td>

            <td>$${producto.precio}</td>

            <td>

                <img
                    src="/uploads/${producto.imagen}"
                    width="80"
                >

            </td>

            <td>

                <button

                    onclick="editarProducto(

                        ${producto.id_producto},

                        '${producto.codigo}',

                        '${producto.nombre}',

                        '${producto.marca}',

                        '${producto.categoria}',

                        '${producto.genero}',

                        '${producto.precio}'

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
                    onclick="eliminarProducto(${producto.id_producto})"
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
// EDITAR PRODUCTO
// ======================

function editarProducto(

    id,
    codigo,
    nombre,
    marca,
    categoria,
    genero,
    precio

){

    idEditando = id;

    document.getElementById('codigo').value =
        codigo;

    document.getElementById('nombre').value =
        nombre;

    document.getElementById('marca').value =
        marca;

    document.getElementById('categoria').value =
        categoria;

    document.getElementById('genero').value =
        genero;

    document.getElementById('precio').value =
        precio;

    window.scrollTo({

        top: 0,
        behavior: 'smooth'

    });

}

// ======================
// ELIMINAR PRODUCTO
// ======================

async function eliminarProducto(id) {

    const confirmar =
        confirm(
            '¿Eliminar producto?'
        );

    if(!confirmar) return;

    const respuesta =
        await fetch(

            '/api/productos/' + id,

            {
                method: 'DELETE'
            }

        );

    const data =
        await respuesta.json();

    alert(data.mensaje);

    cargarProductos();

}

// ======================
// INICIAR
// ======================

cargarProductos();