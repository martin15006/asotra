const notificacion = document.getElementById("notificacion");

let temporizador = null;

function avisar(texto) {
    notificacion.textContent = texto;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
        notificacion.textContent = "";
    }, 3000);
}

let html = "";
let borradorId = null;

for (const sec of SECCIONES) {
    html += `<h2>${sec.titulo}</h2>`;

    for (const it of sec.items) {

        html +=
            `<div class="item">
            <p>${it.n}. ${it.texto}</p>
                <div class="opciones">
                    <label><input type="radio" name='item-${it.n}' value="cumple" required>Cumple</label>
                    <label><input type="radio" name='item-${it.n}' value="no_cumple">No cumple</label>
                    <label><input type="radio" name='item-${it.n}' value="no_aplica"> No aplica</label>
                </div>
                <input type="text" name='obs-${it.n}' placeholder='observaciones'>
            </div>`
    }
}

document.getElementById("aislamiento").innerHTML = html;

function leerFormulario() {
    const registro = {
        habitacion: document.querySelector('[name="habitacion"]').value,
        items: [],
    };

    for (const sec of SECCIONES) {
        for (const it of sec.items) {
            const marcados = document.querySelector(`input[name="item-${it.n}"]:checked`);
            const estados = marcados ? marcados.value : "";
            const evaluar = document.querySelector(`input[name="obs-${it.n}"]`).value;

            registro.items.push({ n: it.n, estados: estados, evaluar: evaluar });
        }
    }
    return registro;
}

document.getElementById("formulario").addEventListener("submit",
    async (e) => {
        e.preventDefault();

        const registro = leerFormulario();

        try {
            const respuesta = await fetch("/api/formularios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registro),
            });

            if (respuesta.ok) {
                avisar("Guardado");
                if (borradorId !== null) {
                    await fetch(`/api/borradores/${borradorId}`, { method: "DELETE" });
                }
                borradorId = null;
                e.target.reset();
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                avisar("El Servidor no responde");
            }
        } catch {
            avisar("No hay conexión con el servidor");
        }
    })

document.getElementById("guardarBorrador").addEventListener("click", async (e) => {
    const registro = leerFormulario();

    if (!registro.habitacion) {
        avisar("Ingresa el numero de habitación");
        return;
    }

    try {
        const nuevo = borradorId === null;
        const respuesta = await fetch(
            nuevo ? "/api/borradores" : `/api/borradores/${borradorId}`,
            {
                method: nuevo ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registro)
            }
        );

        if (respuesta.ok) {
            e.target.form.reset();
            borradorId = null;
            history.replaceState(null, "", location.pathname);
            window.scrollTo({ top: 0, behavior: "smooth" });
            avisar("Borrador guardado");
        }

        else {
            avisar("No se pudo guardar el borrador");
        }
    } catch (error) {
        console.log(error);
        avisar("No se pudo conectar al servidor");
    };
});

async function abrirBorrador() {
    const parametros = new URLSearchParams(location.search);
    const id = parametros.get("borrador");
    if (!id) {
        return;
    }

    const respuesta = await fetch(`/api/borradores/${id}`);
    if (!respuesta.ok) {
        avisar("Ese borrador ya no existe");
        return;
    }
    const registro = await respuesta.json();

    document.querySelector('[name="habitacion"]').value = registro.habitacion;

    for (const i of registro.items) {
        if (i.estados !== "") {
            const radio = document.querySelector(
                `input[name="item-${i.n}"][value="${i.estados}"]`
            );
            radio.checked = true;
        }
        document.querySelector(`[name="obs-${i.n}"]`).value = i.evaluar;
    }

    borradorId = registro.id;
    avisar(`Continuando el borrador de la habitación: ${registro.habitacion}`);
}

abrirBorrador();