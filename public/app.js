let html = "";

for (const sec of SECCIONES) {
    html += `<h2>${sec.titulo}</h2>`;

    for (const it of sec.items) {

        html +=
            `<div class="item">
            <p>${it.n}. ${it.texto}</p>
                <div class="opciones" required>
                    <label><input type="radio" name='item-${it.n}' value="cumple">Cumple</label>
                    <label><input type="radio" name='item-${it.n}' value="no_cumple">No cumple</label>
                    <label><input type="radio" name='item-${it.n}' value="no_aplica"> No aplica</label>
                </div>
                <input type="text" name='obs-${it.n}' placeholder='observaciones'>
            </div>`
    }
}

document.getElementById("aislamiento").innerHTML = html;

document.getElementById("formulario").addEventListener("submit",
    async (e) => {
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
        console.log(registro);

        const notificacion = document.getElementById("notificacion");
        

        try {
            const respuesta = await fetch("/api/formularios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registro),
            });

            if (respuesta.ok) {
                notificacion.textContent = "Guardado";
                e.target.reset();
            } else {
                notificacion.textContent = "El Servidor no responde";
            }
        } catch {
            notificacion.textContent = "No hay conexion con el servidor";
        }
    })