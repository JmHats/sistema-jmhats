function calcularTotal() {
    let total = 0;

    document.querySelectorAll('input[type="checkbox"]:checked')
    .forEach(el => {
        total += parseFloat(el.value);
    });

    document.getElementById('total').innerText = total;
}


// 🧹 LIMPIAR FORMULARIO
function limpiarFormulario() {

    document.getElementById('nombre').value = '';
    document.getElementById('numero').value = '';

    document.getElementById('texana1').value = '';
    document.getElementById('texana2').value = '';
    document.getElementById('texana3').value = '';

    document.getElementById('horma1').value = '';
    document.getElementById('horma2').value = '';
    document.getElementById('horma3').value = '';

    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);

    document.getElementById('total').innerText = '0';
}


// 🖨️ IMPRIMIR TICKET
function imprimirTicket() {

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('numero').value;
    const total = document.getElementById('total').innerText;

    const texanas = [];

    function obtenerServicios(clase) {
        let servicios = [];
        document.querySelectorAll(`.${clase}:checked`).forEach(el => {
            servicios.push(el.parentElement.innerText.trim());
        });
        return servicios;
    }

    function agregarTexana(num, tex, horma, clase) {
        const modelo = document.getElementById(tex).value;
        const h = document.getElementById(horma).value;
        const servicios = obtenerServicios(clase);

        if (modelo || h || servicios.length) {
            texanas.push({ num, modelo, h, servicios });
        }
    }

    agregarTexana(1, 'texana1', 'horma1', 'servicio1');
    agregarTexana(2, 'texana2', 'horma2', 'servicio2');
    agregarTexana(3, 'texana3', 'horma3', 'servicio3');

    function generar(tipo) {

        let txt = '';
        const linea = '--------------------------------';

        txt += '       JM HATS\n';
        txt += `     ${tipo}\n\n`;

        txt += `Cliente:\n${nombre}\n`;
        txt += `Tel: ${telefono}\n`;
        txt += linea + '\n';

        texanas.forEach(t => {

            txt += `\nTexana ${t.num}\n`;

            if (t.modelo)
                txt += `Mod: ${t.modelo.substring(0,20)}\n`;

            if (t.h)
                txt += `Hor: ${t.h.substring(0,20)}\n`;

            t.servicios.forEach(s => {
                txt += `- ${s.substring(0,25)}\n`;
            });

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