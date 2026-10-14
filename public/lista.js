async function cargar() {
    const respuestas = await fetch("/api/formularios");
    const registros = await respuestas.json();

    let html ="";
    for (const r of registros.reverse()){
        const fecha = r.hora ? new Date(r.hora).toLocaleString("es-CO") : "Sin fecha";

        const cumplieron = r.items.filter(c => c.estados === "cumple").length;
        const no_cumplieron = r.items.filter(c => c.estados === "no_cumple").length;
        const evaluado = cumplieron + no_cumplieron;
        const no_aplicaron = r.items.filter(c => c.estados === "no_aplica").length;

        const cumplimiento = evaluado > 0
        ? Math.round(cumplieron / evaluado * 100) + "%" 
        : "-";

        html += `
        <div class="tarjeta">
        <h3>Habitación ${r.habitacion}</h3>
        <p>${fecha}</p>
        <p>no aplica: ${no_aplicaron}</p>
        <p>Estados: ${cumplieron} de ${r.items.length}</p>
        <p>Evaluados: ${evaluado}</p>
        <p>cumple: ${cumplieron}</p>
        <p>porcentaje: ${cumplimiento}</p>
        </div>
        `;
    }
    document.getElementById("lista").innerHTML = html;
}

cargar()
