async function agregarCliente() {
    const nombre = document.getElementById('nombre').value.trim();

    if (!nombre) {
        alert("El nombre es obligatorio");
        return;
    }

    const productos = [
        {
            nombre: document.getElementById('producto1').value,
            precio: parseFloat(document.getElementById('precio1').value) || 0
        },
        {
            nombre: document.getElementById('producto2').value,
            precio: parseFloat(document.getElementById('precio2').value) || 0
        },
        {
            nombre: document.getElementById('producto3').value,
            precio: parseFloat(document.getElementById('precio3').value) || 0
        }
    ];

    const res = await fetch('/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, productos })
    });

    if (!res.ok) {
        const error = await res.text();
        alert("Error: " + error);
        return;
    }

    alert('Cliente agregado 🔥');
    cargarClientes();
}

async function cargarClientes() {
    try {
        const busqueda = document.getElementById('busqueda').value;

        const res = await fetch('/clientes?search=' + busqueda);
        const clientes = await res.json();

        console.log(clientes); // 🔥 IMPORTANTE PARA DEBUG

        const tabla = document.getElementById('tablaClientes');
        tabla.innerHTML = '';

        clientes.forEach(c => {

            const totalPagado = (c.pagos || []).reduce((sum, p) => sum + p.monto, 0);
            const saldo = (c.deuda || 0) - totalPagado;

            tabla.innerHTML += `
            <tr>
                <td>${c.nombre}</td>
                <td>${(c.productos || []).map(p => p.nombre + ' ($' + p.precio + ')').join('<br>')}</td>
                <td>${new Date(c.fecha).toLocaleDateString()}</td>
                <td>$${c.deuda}</td>
                <td>$${totalPagado}</td>
                <td>$${saldo}</td>
                <td>
                    <input id="pago_${c.id}" placeholder="Monto">
                    <button onclick="pagar(${c.id})">Pagar</button>
                </td>
                <td>
                    <button onclick="eliminar(${c.id})">Eliminar</button>
                </td>
            </tr>
            `;
        });

    } catch (error) {
        console.error("Error cargando clientes:", error);
    }
}

async function pagar(id) {
    const monto = document.getElementById('pago_' + id).value;

    await fetch('/pago/' + id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: parseFloat(monto) })
    });

    cargarClientes();
}

async function eliminar(id) {
    await fetch('/clientes/' + id, { method: 'DELETE' });
    cargarClientes();
}

function verTodos() {
    document.getElementById('busqueda').value = '';
    cargarClientes();
}

// Cargar al iniciar
cargarClientes();