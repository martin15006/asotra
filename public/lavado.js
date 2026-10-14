let contador = 0;

function agregarChequeo() {
    contador++;
    const n = contador;

    document.getElementById("bloques").insertAdjacentHTML("beforeend", `
        <div class="item">
            <p><strong>chequeo ${n}</strong></p>

            <p>Indicación</p>
            <div class="opciones">
                <label><input type="checkbox" name="indi-${n}" value="ant_pac">Antes del paciente</label>
                <label><input type="checkbox" name="indi-${n}" value="ant_asept">Antes de actividad aseptica</label>
                <label><input type="checkbox" name="indi-${n}" value="desp_fc">Despues fluido corporales</label>
                <label><input type="checkbox" name="indi-${n}" value="desp_pac">Despues del paciente</label>
                <label><input type="checkbox" name="indi-${n}" value="desp_ent_p">Despues del entorno del paciente</label>
            </div>

            <p>Acción HM</p>
            <div class="opciones">
                <label><input type="radio" name="acci-${n}" value="fm" required>Fricción de manos</label>
                <label><input type="radio" name="acci-${n}" value="lv">Lavado de manos</label>
                <label><input type="radio" name="acci-${n}" value="omision">Omisión</label>
                <label><input type="radio" name="acci-${n}" value="guantes">Guantes</label>
            </div>
        </div>`
    );
}

document.getElementById("chequeo").addEventListener("submit", async (e) => {
    e.preventDefault();

    const chequeo = {
        perfil: document.querySelector('[name="perfil"]').value,
        servicio: document.querySelector('[name="servicio"]').value,
        bloques: [],
    };

    for (let n = 1; n <= contador; n++) {
        const cumple = document.querySelectorAll(`input[name="indi-${n}"]:checked`);

        const no_cumple = Array.from(cumple).map(c => c.value);

        const no_aplica = document.querySelector(`input[name="acci-${n}"]:checked`).value;

        chequeo.bloques.push({ n: n, no_cumple: no_cumple, no_aplica: no_aplica });
    }

    try {
        const respuesta = await fetch("/api/lavado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chequeo),
        });

        if (respuesta.ok) {
            notificacion.textContent = "Guardado";
            e.target.reset();
            document.getElementById("bloques").innerHTML= "";
            contador= 0;
            agregarChequeo();
        } else {
            notificacion.textContent = "El Servidor no responde";
        }
    } catch {
        notificacion.textContent = "No hay conexion con el servidor";
    }

})

agregarChequeo();
document.getElementById("agregar").addEventListener("click", agregarChequeo);

// pedidos=registros