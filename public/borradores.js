async function cargar() {
    const respuesta = await fetch("/api/borradores")    ;
    const borradores = await respuesta.json();

    if(borradores.length === 0){
        document.getElementById("borradores").innerHTML = "<p>No hay borradores.</p>";
        return;
    }

    let html= "";

    for (const b of borradores.reverse()){
        const fecha = new Date(b.hora).toLocaleString("es-CO");
        const listos = b.items.filter(p => p.estados !=="").length;

        html += `
        <div class="tarjeta">
            <h3>Habitacion ${b.habitacion}</h3>
            <p>Editado: ${fecha}</p>
            <p>${listos} de ${b.items.length} items</p>
            <div class="acciones">
                <a href="principal.html?borrador=${b.id}" class="boton">Continuar chequeo</a>
                <button class="boton eliminar" data-id="${b.id}">Eliminar</button>
            </div>
        </div>
            `;
    } 
    document.getElementById("borradores").innerHTML = html;

    for(const boton of document.querySelectorAll(".eliminar")){
        boton.addEventListener("click", ()=> eliminar(boton.dataset.id));
    }
}

async function eliminar(id) {
    if(!confirm("¿Seguro que quieres eliminar este borrador?")){
        return;
    }
    await fetch(`/api/borradores/${id}`, {method: "DELETE"});
    cargar()
}

cargar()