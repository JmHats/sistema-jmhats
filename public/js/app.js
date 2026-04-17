async function agregarCliente() {

    const cliente = {
        nombre: document.getElementById("nombre").value,
        productos: [
            {
                nombre: document.getElementById("producto1").value,
                precio: Number(document.getElementById("precio1").value)
            },
            {
                nombre: document.getElementById("producto2").value,
                precio: Number(document.getElementById("precio2").value)
            },
            {
                nombre: document.getElementById("producto3").value,
                precio: Number(document.getElementById("precio3").value)
            }
        ]
    };

    await fetch('/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
    });

    // 🔥 LIMPIAR CAMPOS
    document.getElementById("nombre").value = "";
    document.getElementById("producto1").value = "";
    document.getElementById("precio1").value = "";
    document.getElementById("producto2").value = "";
    document.getElementById("precio2").value = "";
    document.getElementById("producto3").value = "";
    document.getElementById("precio3").value = "";

    cargarClientes();
}

async function cargarClientes() {

    const busqueda = document.getElementById("busqueda").value;

    const res = await fetch('/clientes?search=' + busqueda);
    const data = await res.json();

    const tabla = document.getElementById("tablaClientes");
    tabla.innerHTML = "";

    data.forEach(c => {

        const pagado = c.pagos.reduce((sum, p) => sum + p.monto, 0);
        const saldo = c.deuda - pagado;

        tabla.innerHTML += `
        <tr>
            <td>${c.nombre}</td>
            <td>${c.productos.map(p => p.nombre + " ($" + p.precio + ")").join(', ')}</td>
            <td>${new Date(c.fecha).toLocaleDateString()}</td>
            <td>${c.deuda}</td>
            <td>${pagado}</td>
            <td>${saldo}</td>
            <td>
                <input id="pago-${c.id}" placeholder="Pago">
                <button onclick="pagar(${c.id})">Pagar</button>
            </td>
            <td>
                <div style="display:flex; gap:5px; justify-content:center;">
                    <button onclick="abrirAgregar(${c.id}, \`${c.nombre}\`)">Agregar</button>
                    <button onclick="eliminar(${c.id})">Eliminar</button>
                </div>
            </td>
        </tr>
        `;
    });
}

function verTodos() {
    document.getElementById("busqueda").value = "";
    cargarClientes();
}

async function pagar(id) {
    const monto = Number(document.getElementById("pago-" + id).value);

    await fetch('/pago/' + id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto })
    });

    cargarClientes();
}

async function eliminar(id) {
    await fetch('/clientes/' + id, {
        method: 'DELETE'
    });

    cargarClientes();
}

// 🔥 cargar al iniciar
cargarClientes();

let clienteActual = null;

function abrirAgregar(id, nombre) {
    clienteActual = id;

    document.getElementById("modalAgregar").style.display = "block";
    document.getElementById("nombreClienteModal").innerText = nombre;

    // 🔥 LIMPIAR CAMPOS AL ABRIR
    document.getElementById("m_producto1").value = "";
    document.getElementById("m_precio1").value = "";
    document.getElementById("m_producto2").value = "";
    document.getElementById("m_precio2").value = "";
    document.getElementById("m_producto3").value = "";
    document.getElementById("m_precio3").value = "";
}

function cerrarModal() {
    document.getElementById("modalAgregar").style.display = "none";
}

async function guardarProductos() {

    const productos = [
        {
            nombre: document.getElementById("m_producto1").value,
            precio: Number(document.getElementById("m_precio1").value)
        },
        {
            nombre: document.getElementById("m_producto2").value,
            precio: Number(document.getElementById("m_precio2").value)
        },
        {
            nombre: document.getElementById("m_producto3").value,
            precio: Number(document.getElementById("m_precio3").value)
        }
    ].filter(p => p.nombre); // 🔥 SOLO guarda si hay nombre

    if (productos.length === 0) {
        alert("Agrega al menos un producto");
        return;
    }

    await fetch(`/clientes/${clienteActual}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos })
    });

    cerrarModal();
    cargarClientes();
}