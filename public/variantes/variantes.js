async function buscarProducto() {

    const codigo =
        document.getElementById('codigoProducto').value;

    if (codigo.length < 1) return;

    try {

        const res =
            await fetch(`/api/producto/codigo/${codigo}`);

        if (!res.ok) return;

        const producto =
            await res.json();

        document.getElementById('nombreProducto').value =
            producto.nombre;

        document.getElementById('idProducto').value =
            producto.id_producto;

        if (producto.imagen) {

            const img =
                document.getElementById('imagenProducto');

            img.src =
                '/uploads/' + producto.imagen;

            img.style.display = 'block';

        }

    } catch (error) {

        console.log(error);

    }

}

// ======================
// CAMBIAR TALLAS
// ======================

function cambiarTallas() {

    const tipo =
        document.getElementById('tipoVariante').value;

    const talla =
        document.getElementById('talla');

    const cantidadOtro =
        document.getElementById('cantidadOtro');

    talla.innerHTML = '';

    let tallas = [];

    // ======================
    // SI ES OTRO
    // ======================

    if (tipo === 'Otro') {

        talla.style.display = 'none';

        cantidadOtro.style.display = 'block';

        return;

    }

    else {

        talla.style.display = 'block';

        cantidadOtro.style.display = 'none';

    }

    // ======================
    // BOTAS MUJER
    // ======================

    if (tipo === 'Botas Mujer') {

        tallas = [
            '22',
            '22.5',
            '23',
            '23.5',
            '24',
            '24.5',
            '25',
            '25.5',
            '26',
            '26.5',
            '27'
        ];

    }

    // ======================
    // BOTAS HOMBRE
    // ======================

    else if (tipo === 'Botas de hombre') {

        tallas = [
            '25',
            '25.5',
            '26',
            '26.5',
            '27',
            '27.5',
            '28',
            '28.5',
            '29',
            '29.5',
            '30'
        ];

    }

    // ======================
    // BOTAS NIÑO
    // ======================

    else if (tipo === 'Botas de niño') {

        tallas = [
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22'
        ];

    }

    // ======================
    // ROPA Y PANTALONES
    // ======================

    else {

        tallas = [
            'CH',
            'M',
            'G',
            'XG'
        ];

    }

    talla.innerHTML =
        '<option value="">Selecciona talla</option>';

    tallas.forEach(t => {

        talla.innerHTML += `

            <option value="${t}">
                ${t}
            </option>

        `;

    });

}

// ======================
// GUARDAR
// ======================

async function guardarVariante() {

    const id_producto =
        document.getElementById('idProducto').value;

    const color =
        document.getElementById('color').value;

    const tipo =
        document.getElementById('tipoVariante').value;

    const tallaSelect =
        document.getElementById('talla').value;

    const cantidadOtro =
        document.getElementById('cantidadOtro').value;

    let talla = tallaSelect;

    // SI ES OTRO
    if (tipo === 'Otro') {

        talla =
            'Cantidad: ' + cantidadOtro;

    }

    if (!id_producto) {

        alert('Busca un producto');

        return;

    }

    await fetch('/api/variantes', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            id_producto,
            color,
            talla

        })

    });

    alert('Variante guardada');

    // LIMPIAR
    document.getElementById('color').value = '';
    document.getElementById('talla').value = '';
    document.getElementById('cantidadOtro').value = '';

    cargarVariantes();

}

// ======================
// CARGAR VARIANTES
// ======================

async function cargarVariantes() {

    const res =
        await fetch('/api/variantes');

    const data =
        await res.json();

    const lista =
        document.getElementById('lista');

    lista.innerHTML = '';

    data.forEach(v => {

        lista.innerHTML += `

            <tr>

                <td>${v.id_variante}</td>

                <td>${v.id_producto}</td>

                <td>
                    <img src="/uploads/${v.imagen}">
                </td>

                <td>${v.nombre}</td>

                <td>${v.color}</td>

                <td>${v.talla}</td>

                <td>

                    <button onclick="eliminarVariante(${v.id_variante})">

                        Eliminar

                    </button>

                </td>

            </tr>

        `;

    });

}

// ======================
// ELIMINAR
// ======================

async function eliminarVariante(id) {

    if (!confirm('¿Eliminar variante?')) return;

    await fetch(`/api/variantes/${id}`, {

        method: 'DELETE'

    });

    cargarVariantes();

}

cargarVariantes();