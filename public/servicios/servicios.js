function calcularTotal() {
    let total = 0;

    // ✅ SOLO SUMAR LOS QUE TIENEN VALUE (servicios normales)
    document.querySelectorAll('input[type="checkbox"][value]:checked')
    .forEach(el => {
        total += parseFloat(el.value);
    });

    // ✅ HERRAJES
    const h1 = document.getElementById('herraje1_check');
    const h2 = document.getElementById('herraje2_check');
    const h3 = document.getElementById('herraje3_check');

    if (h1 && h1.checked) {
        let letras = parseInt(document.getElementById('herraje1').value) || 0;
        total += letras * 30;
    }

    if (h2 && h2.checked) {
        let letras = parseInt(document.getElementById('herraje2').value) || 0;
        total += letras * 30;
    }

    if (h3 && h3.checked) {
        let letras = parseInt(document.getElementById('herraje3').value) || 0;
        total += letras * 30;
    }

    // ✅ EXTRAS
    const e1 = document.getElementById('extra1_check');
    const e2 = document.getElementById('extra2_check');
    const e3 = document.getElementById('extra3_check');

    if (e1 && e1.checked) {
        let precio = parseFloat(document.getElementById('extra1_precio').value) || 0;
        total += precio;
    }

    if (e2 && e2.checked) {
        let precio = parseFloat(document.getElementById('extra2_precio').value) || 0;
        total += precio;
    }

    if (e3 && e3.checked) {
        let precio = parseFloat(document.getElementById('extra3_precio').value) || 0;
        total += precio;
    }

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

    // HERRAJES
    document.getElementById('herraje1').value = '';
    document.getElementById('herraje2').value = '';
    document.getElementById('herraje3').value = '';

    document.getElementById('herraje1_check').checked = false;
    document.getElementById('herraje2_check').checked = false;
    document.getElementById('herraje3_check').checked = false;

    // EXTRAS
    document.getElementById('extra1_nombre').value = '';
    document.getElementById('extra2_nombre').value = '';
    document.getElementById('extra3_nombre').value = '';

    document.getElementById('extra1_precio').value = '';
    document.getElementById('extra2_precio').value = '';
    document.getElementById('extra3_precio').value = '';

    document.getElementById('extra1_check').checked = false;
    document.getElementById('extra2_check').checked = false;
    document.getElementById('extra3_check').checked = false;

    // CHECKBOXES
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);

    document.getElementById('total').innerText = '0';
}


// 🖨️ IMPRIMIR TICKET
function imprimirTicket() {

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('numero').value;
    const total = document.getElementById('total').innerText;

    const texanas = [];

    function obtenerServicios(clase, num) {
        let servicios = [];

        // servicios normales
        document.querySelectorAll(`.${clase}:checked`).forEach(el => {
            servicios.push(el.parentElement.innerText.trim());
        });

        // herraje
        const herrajeCheck = document.getElementById(`herraje${num}_check`);
        const letras = document.getElementById(`herraje${num}`).value;

        if (herrajeCheck.checked && letras) {
            servicios.push(`Herraje (${letras} letras)`);
        }

        // extra
        const extraCheck = document.getElementById(`extra${num}_check`);
        const extraNombre = document.getElementById(`extra${num}_nombre`).value;
        const extraPrecio = document.getElementById(`extra${num}_precio`).value;

        if (extraCheck.checked && extraNombre) {
            servicios.push(`${extraNombre} $${extraPrecio}`);
        }

        return servicios;
    }

    function agregarTexana(num, tex, horma, clase) {
        const modelo = document.getElementById(tex).value;
        const h = document.getElementById(horma).value;
        const servicios = obtenerServicios(clase, num);

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