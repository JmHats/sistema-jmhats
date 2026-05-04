function calcularTotal() {
    let total = 0;

    document.querySelectorAll('input[type="checkbox"][value]:checked')
    .forEach(el => total += parseFloat(el.value));

    // HERRAJES
    for (let i = 1; i <= 3; i++) {
        const check = document.getElementById(`herraje${i}_check`);
        const letras = document.getElementById(`herraje${i}`);

        if (check && check.checked) {
            total += (parseInt(letras.value) || 0) * 30;
        }
    }

    // EXTRAS
    for (let i = 1; i <= 3; i++) {
        const check = document.getElementById(`extra${i}_check`);
        const precio = document.getElementById(`extra${i}_precio`);

        if (check && check.checked) {
            total += parseFloat(precio.value) || 0;
        }
    }

    document.getElementById('total').innerText = total;
}

function limpiarFormulario() {
    document.querySelectorAll('input').forEach(i => {
        if (i.type === 'checkbox') i.checked = false;
        else i.value = '';
    });

    document.getElementById('total').innerText = '0';
}

function imprimirTicket() {

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('numero').value;
    const total = document.getElementById('total').innerText;

    function generar(tipo) {

        let contenido = `
        JM HATS
${tipo}
--------------------------
Cliente: ${nombre}
Tel: ${telefono}
--------------------------
`;

        for (let i = 1; i <= 3; i++) {

            const modelo = document.getElementById(`texana${i}`).value;
            const horma = document.getElementById(`horma${i}`).value;

            let servicios = [];

            document.querySelectorAll(`.servicio${i}:checked`)
            .forEach(el => servicios.push(el.parentElement.innerText));

            const herrajeCheck = document.getElementById(`herraje${i}_check`);
            const letras = document.getElementById(`herraje${i}`).value;

            if (herrajeCheck && herrajeCheck.checked && letras) {
                servicios.push(`Herraje (${letras} letras)`);
            }

            const extraCheck = document.getElementById(`extra${i}_check`);
            const extraNom = document.getElementById(`extra${i}_nombre`).value;
            const extraPrecio = document.getElementById(`extra${i}_precio`).value;

            if (extraCheck && extraCheck.checked && extraNom) {
                servicios.push(`${extraNom} $${extraPrecio}`);
            }

            if (modelo || horma || servicios.length) {
                contenido += `\nTexana ${i}\n`;
                if (modelo) contenido += `Mod: ${modelo}\n`;
                if (horma) contenido += `Hor: ${horma}\n`;

                servicios.forEach(s => contenido += `- ${s}\n`);
            }
        }

        contenido += `
--------------------------
TOTAL: $${total}

Gracias por su compra
`;

        return contenido;
    }

    // 🔥 AQUÍ SE GENERAN LAS 2 COPIAS
    const contenidoFinal =
        generar('--- COPIA CLIENTE ---') +
        '\n\n==========================\n\n' +
        generar('--- COPIA NEGOCIO ---');

    const win = window.open('', '', 'width=300,height=600');

    win.document.write(`
        <pre style="font-family: monospace; font-size:14px;">
${contenidoFinal}
        </pre>
    `);

    win.document.close();

    setTimeout(() => {
        win.focus();
        win.print();
        win.close();
    }, 500);
}