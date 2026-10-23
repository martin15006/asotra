const INDICACIONES = {
    ant_pac: "Antes del paciente",
    ant_asept: "Antes de accion aseptica",
    desp_fc: "Despues de fluidos corporales",
    desp_pac: "Despues del paciente",
    desp_ent_p: "Despues del entorno del paciente"
}

const ACCIONES = {
    fm: "Fricción de manos",
    lv: "Lavado de manos",
    omision: "Omisión",
    guantes: "Guantes"
}


async function cargar() {
    const respuestas = await fetch("/api/lavado");
    const chequeo = await respuestas.json()

    let html = "";
    for (const c of chequeo.reverse()) {
        const fecha = c.hora ? new Date(c.hora).toLocaleString("es-CO") : "Sin fecha";

        let detalles = "";
        for (const i of c.bloques) {
            detalles += `<li>${i.n}.  ${INDICACIONES[i.indicacion]}: ${ACCIONES[i.accion]}</li>`;
        }
        console.log(fecha, c.perfil, "chequeos", c.bloques.length, detalles);

        html += `
        <div class="tarjeta">
        <h3>Perfil: ${c.perfil}</h3>
        <h3>Servicio: ${c.servicio}</h3>
        <p>${fecha}</p>
        <h4>Chequeos realizados: ${c.bloques.length}</h4>
        <ul class="detalle">${detalles}</ul>
        <div class="descargar">
            <a href="/api/lavado/excel/${c.id}" class="boton">Descargar</a>
        </div>
        </div>
        `
    }
    document.getElementById("higiene").innerHTML = html;
}
cargar()