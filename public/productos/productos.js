async function guardarProducto() {

    const formData = new FormData();

    formData.append('codigo', codigo.value);
    formData.append('nombre', nombre.value);
    formData.append('talla', talla.value);
    formData.append('marca', marca.value);
    formData.append('color', color.value);
    formData.append('categoria', categoria.value);
    formData.append('subcategoria', subcategoria.value);

    formData.append('mercadoLibre', ml.checked);
    formData.append('pagina', pagina.checked);
    formData.append('tiktok', tiktok.checked);

    if (imagen.files[0]) {
        formData.append('imagen', imagen.files[0]);
    }

    await fetch('/inventario', {
        method: 'POST',
        body: formData
    });

    alert('Guardado 🔥');
    cargarProductos();
}

async function cargarProductos() {
    const res = await fetch('/inventario');
    const data = await res.json();

    lista.innerHTML = '';

    data.forEach(p => {
        lista.innerHTML += `
        <div style="border:1px solid #ccc; margin:10px; padding:10px;">
            <img src="${p.imagen}" width="100"><br>
            <b>${p.nombre}</b><br>
            ${p.marca} - ${p.talla}<br>
            ${p.categoria} / ${p.subcategoria}
        </div>
        `;
    });
}

cargarProductos();