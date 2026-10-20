let contador = 0;

function agregarChequeo() {
    contador++;
    const n = contador;

    document.getElementById("bloques").insertAdjacentHTML("beforeend", `
        <div class="item">
            <p><strong>chequeo ${n}</strong></p>
            
            <p>Indicación</p>
            <div class="opciones">
                <label><input type="radio" name="indi-${n}" value="ant_pac" required>Antes del paciente</label>
                <label><input type="radio" name="indi-${n}" value="ant_asept">Antes de accion aseptica</label>
                <label><input type="radio" name="indi-${n}" value="desp_fc">Despues fluido corporales</label>
                <label><input type="radio" name="indi-${n}" value="desp_pac">Despues del paciente</label>
                <label><input type="radio" name="indi-${n}" value="desp_ent_p">Despues del entorno del paciente</label>
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
const notificacion = document.getElementById("notificacion");

function intentarAgregarChequeo() {
    const n = contador;

    const indicacion = document.querySelector(`input[name="indi-${n}"]:checked`);
    const accion = document.querySelector(`input[name="acci-${n}"]:checked`);

    if (!indicacion || !accion) {
        notificacion.textContent = `Completa el chequeo ${n} antes de añadir otro`;
        return;
    }

    notificacion.textContent = "";
    agregarChequeo();
}

document.getElementById("chequeo").addEventListener("submit",
    async (e) => {
        e.preventDefault();

        const chequeo = {
            perfil: document.querySelector('[name="perfil"]').value,
            servicio: document.querySelector('[name="servicio"]').value,
            bloques: [],
        };

        for (let n = 1; n <= contador; n++) {
            const indicacion = document.querySelector(`input[name="indi-${n}"]:checked`).value;
            const accion = document.querySelector(`input[name="acci-${n}"]:checked`).value;

            chequeo.bloques.push({ n: n, indicacion: indicacion, accion: accion });
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
                document.getElementById("bloques").innerHTML = "";
                contador = 0;
                agregarChequeo();
            } else {
                notificacion.textContent = "El Servidor no responde";
            }
        } catch {
            notificacion.textContent = "No hay conexion con el servidor";
        }

    })

agregarChequeo();
document.getElementById("agregar").addEventListener("click", intentarAgregarChequeo);
