// 🔥 GENERAR PANTALONES
const contenedor = document.getElementById('pantalones');

for (let i = 1; i <= 6; i++) {
    contenedor.innerHTML += `
        <h3>Pantalón ${i}</h3>
        <div class="row">
            <input id="marca${i}" placeholder="Marca">
            <input id="talla${i}" placeholder="Talla">
        </div>
    `;
}


// 🔢 CALCULAR TOTAL
function calcularTotal() {
    let cantidad = 0;

    for (let i = 1; i <= 6; i++) {
        const marca = document.getElementById('marca' + i).value.trim();
        const talla = document.getElementById('talla' + i).value.trim();

        if (marca || talla) {
            cantidad++;
        }
    }

    const total = cantidad * 170;

    document.getElementById('total').innerText = total;
}


// 🧹 LIMPIAR
function limpiarFormulario() {

    document.getElementById('nombre').value = '';
    document.getElementById('numero').value = '';

    for (let i = 1; i <= 6; i++) {
        document.getElementById('marca' + i).value = '';
        document.getElementById('talla' + i).value = '';
    }

    document.getElementById('total').innerText = '0';
}


// 🖨️ IMPRIMIR TICKET (IGUAL A TEXANAS)
function imprimirTicket() {

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('numero').value;
    const total = document.getElementById('total').innerText;

    const pantalones = [];

    for (let i = 1; i <= 6; i++) {
        const marca = document.getElementById('marca' + i).value;
        const talla = document.getElementById('talla' + i).value;

        if (marca || talla) {
            pantalones.push({ num: i, marca, talla });
        }
    }

    function generar(tipo) {

        let txt = '';
        const linea = '--------------------------------';

        txt += '       JM HATS\n';
        txt += `     ${tipo}\n\n`;

        txt += `Cliente:\n${nombre}\n`;
        txt += `Tel: ${telefono}\n`;
        txt += linea + '\n';

        pantalones.forEach(p => {

            txt += `\nPantalón ${p.num}\n`;

            if (p.marca)
                txt += `Marca: ${p.marca.substring(0,20)}\n`;

            if (p.talla)
                txt += `Talla: ${p.talla.substring(0,20)}\n`;

            txt += `Servicio: Almidonado ($170)\n`;

        });

        txt += '\n' + linea + '\n';
        txt += `TOTAL: $${total}\n\n`;
        txt += 'Gracias por su\n';
        txt += 'compra\n';

        return txt;
    }

    const contenido =
        generar('COPIA CLIENTE') +
        '\n\n=============================\n\n' +
        generar('COPIA NEGOCIO');

    const win = window.open('', '', 'width=300,height=600');

    win.document.write(`
        <pre style="
            font-size:14px;
            line-height:1.3;
            width:220px;
            margin:0;
            font-family: monospace;
        ">
${contenido}
        </pre>
    `);

    win.document.close();
    win.print();
}