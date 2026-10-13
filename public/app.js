let html = "";

for (const sec of SECCIONES) {
    html += `<h2>${sec.titulo}</h2>`;

    for (const it of sec.items) {

        html +=
            `<div class="item">
            <p>${it.n}. ${it.texto}</p>
            <label><input type="radio" name='item-${it.n}' value="cumple">Cumple</label>
            <label><input type="radio" name='item-${it.n}' value="no_cumple">No cumple</label>
            <label><input type="radio" name='item-${it.n}' value="no_aplica" checked> No aplica</label>
            <input type="text" name='obs-${item.n}' placeholder='observaciones'>
            </div>`
    }
}

document.getElementById("aislamiento").innerHTML = html;

document.getElementById("formulario").addEventListener("submit",
    (e) => {
        e.preventDefault();

        const registro = {
            habitacion:
                document.querySelector('[name="habitacion"]').value,
            items: [],
        };

        for (const sec of SECCIONES) {
            for (const it of sec.items) {
                const estados =
                    document.querySelector(`input[name="item-${it.n}"]:checked`).value;
                const evaluar =
                    document.querySelector(`input[name="obs-${it.n}"]`).value;

                registro.items.push({ n: it.n, estados: estados, evaluar: evaluar });
            }
        }
        console.log(registro)
    }
)