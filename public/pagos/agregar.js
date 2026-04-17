const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function cargarCliente() {
    const res = await fetch('/clientes');
    const clientes = await res.json();

    const cliente = clientes.find(c => c.id == id);

    if (cliente) {
        document.getElementById('nombreCliente').innerText = "Cliente: " + cliente.nombre;
    }
}

async function guardar() {
    const productos = [
        {
            nombre: document.getElementById('producto1').value,
            precio: Number(document.getElementById('precio1').value)
        },
        {
            nombre: document.getElementById('producto2').value,
            precio: Number(document.getElementById('precio2').value)
        },
        {
            nombre: document.getElementById('producto3').value,
            precio: Number(document.getElementById('precio3').value)
        }
    ];

    await fetch(`/clientes/${id}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos })
    });

    alert("Productos agregados correctamente");
    window.location.href = "/";
}

function volver() {
    window.location.href = "/";
}

cargarCliente();