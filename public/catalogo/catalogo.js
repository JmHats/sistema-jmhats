async function cargarCatalogo() {

    const res =
        await fetch('/api/catalogo');

    const data =
        await res.json();

    const lista =
        document.getElementById('lista');

    lista.innerHTML = '';

    data.forEach(p => {

        let plataformas = [];

        if (p.mercado_libre == 1) {
            plataformas.push('Mercado Libre');
        }

        if (p.tiktok == 1) {
            plataformas.push('TikTok');
        }

        if (p.web == 1) {
            plataformas.push('Web');
        }

        lista.innerHTML += `

        <tr>

            <td>
                <img src="/uploads/${p.imagen}">
            </td>

            <td>${p.codigo}</td>

            <td>${p.nombre}</td>

            <td>$${p.precio}</td>

            <td>
                Matehuala:
                ${p.sucursales["Matehuala"] || 0}
            </td>

            <td>
                Doctor Arroyo:
                ${p.sucursales["Doctor Arroyo"] || 0}
            </td>

            <td>
                Charcas:
                ${p.sucursales["Charcas"] || 0}
            </td>

            <td>
                ${plataformas.length > 0
                    ? plataformas.join(', ')
                    : 'Sin plataformas'}
            </td>

        </tr>

        `;

    });

}

cargarCatalogo();