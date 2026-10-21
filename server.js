const express = require("express");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs")
const SECCIONES = require("./public/items.js");

const app = express();
const PORT = 3000;
const ARCHIVO = path.join(__dirname, "data", "registros.json");
const MANOS = path.join(__dirname, "data", "chequeo.json");
const BORRADORES = path.join(__dirname, "data", "borrador.json");

app.use(express.json());

// Recarga en vivo: solo con "npm run dev" (pasa --dev). Al guardar algo en public/ el navegador se actualiza solo.
if (process.argv.includes("--dev")) {
    const livereload = require("livereload");
    const connectLivereload = require("connect-livereload");
    livereload.createServer({ exts: ["html", "css", "js"] }).watch(path.join(__dirname, "public"));
    app.use(connectLivereload({ ignore: [/^\/api\//] }));
}

app.use(express.static(path.join(__dirname, "public")));


// descargar todos los chequos de aislamiento en un excel

async function enviarExelAislamiento(res, registros, nombreArchivo) {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Cuarto de Aislamiento");

    hoja.columns = [
        { header: "Fecha", key: "fecha" },
        { header: "Habitación", key: "habitacion" },
        { header: "Item", key: "item" },
        { header: "Aspecto", key: "aspecto" },
        { header: "Estado", key: "estado" },
        { header: "Observación", key: "observacion" }
    ]

    for (const l of registros) {
        const fecha = l.hora ? new Date(l.hora).toLocaleString("es-CO") : "Sin fecha";
        for (const it of l.items) {
            hoja.addRow({
                fecha: fecha,
                habitacion: l.habitacion,
                item: it.n,
                aspecto: SECCIONES[0].items.find(x => x.n === it.n).texto,
                estado: it.estados,
                observacion: it.evaluar,
            });
        }
    };

    for (const col of hoja.columns) {
        let max = 0;
        col.eachCell(celda => {
            const largo = celda.value ? String(celda.value).length : 0;
            if (largo > max) max = largo;
        });
        col.width = Math.min(max + 2, 60);
    };

    hoja.getRow(1).font = { bold: true };
    hoja.views = [{ state: "frozen", ySplit: 1 }];
    hoja.autoFilter = { from: "A1", to: "F1" };
    hoja.getColumn("aspecto").alignment = { wrapText: true, vertical: "top" };

    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    await libro.xlsx.write(res);
    res.end();
}


// descargar todos los chequeos de HM en un excel 

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

async function enviarExel(res, lavado, nombreArchivo) {
    const bloques = new ExcelJS.Workbook();
    const hoja = bloques.addWorksheet("Higiene de manos");

    hoja.columns = [
        { header: "Fecha", key: "fecha" },
        { header: "Perfil", key: "perfil" },
        { header: "Servicio", key: "servicio" },
        { header: "Chequeo", key: "chequeo" },
        { header: "Indicación", key: "indicacion" },
        { header: "Acción HM", key: "accion" }
    ]

    for (const l of lavado) {
        const fecha = new Date(l.hora).toLocaleString("es-CO");
        for (const b of l.bloques) {
            hoja.addRow({
                fecha: fecha,
                perfil: l.perfil,
                servicio: l.servicio,
                chequeo: b.n,
                indicacion: INDICACIONES[b.indicacion],
                accion: ACCIONES[b.accion],
            });
        }
    };

    for (const col of hoja.columns) {
        let max = 0;
        col.eachCell(celda => {
            const largo = celda.value ? String(celda.value).length : 0;
            if (largo > max) max = largo;
        });
        col.width = max + 2;
    };

    hoja.getRow(1).font = { bold: true };
    hoja.views = [{ state: "frozen", ySplit: 1 }];
    hoja.autoFilter = { from: "A1", to: "F1" };

    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    await bloques.xlsx.write(res);
    res.end();
}

function leer(archivo) {
    try {
        return JSON.parse(fs.readFileSync(archivo, "utf8"));
    } catch {
        return [];
    }
}

function guardar(archivo, nuevo) {
    const lista = leer(archivo);
    const borrador = { id: Date.now(), hora: new Date().toISOString(), ...nuevo };
    lista.push(borrador);
    fs.writeFileSync(archivo, JSON.stringify(lista, null, 2));
    return borrador;
}

app.get("/api/formularios", (req, res) => {
    res.json(leer(ARCHIVO));
});

app.get("/api/lavado", (req, res) => {
    res.json(leer(MANOS));
});

app.post("/api/formularios", (req, res) => {
    guardar(ARCHIVO, req.body);
    res.status(201).json({ ok: true });
});


app.post("/api/lavado", (req, res) => {
    guardar(MANOS, req.body);
    res.status(201).json({ ok: true });
});

app.get("/api/lavado/excel", async (req, res) => {
    await enviarExel(res, leer(MANOS), "lavado.xlsx");
});

app.get("/api/lavado/excel/:id", async (req, res) => {
    const id = Number(req.params.id);
    const encontrados = leer(MANOS).filter(p => p.id === id);

    if (encontrados.length === 0) {
        return res.status(404).send("No Existe ese registro");
    };

    await enviarExel(res, encontrados, `lavado-${id}.xlsx`);
});

app.get("/api/formularios/excel", async (req, res) => {
    await enviarExelAislamiento(res, leer(ARCHIVO), "Aislamiento.xlsx");
});

app.get("/api/formularios/excel/:id", async (req, res) => {
    const id = Number(req.params.id);
    const encontrados = leer(ARCHIVO).filter(p => p.id === id);

    if (encontrados.length === 0) {
        return res.status(404).send("No existe este registro");
    };

    await enviarExelAislamiento(res, encontrados, `aislamiento-${id}.xlsx`)
})


// Borrador 
// ver todos los borradores guardados
app.get("/api/borradores", (req, res) => {
    res.json(leer(BORRADORES));
});

// ver solo 1 borrador guardado
app.get("/api/borradores/:id", (req, res) => {
    const id = Number(req.params.id);
    const borrador = leer(BORRADORES).find(b => b.id === id);
    if (!borrador) {
        return res.status(404).json({ error: "No existe ese borrador" })
    }
    res.json(borrador);
});

// crear un borrador 
app.post("/api/borradores", (req, res) => {
    const nuevo = guardar(BORRADORES, req.body);
    res.status(201).json({ ok: true, id: nuevo.id });
});

// Actualizar un borrador 
app.put("/api/borradores/:id", (req, res) => {
    const id = Number(req.params.id);
    const lista = leer(BORRADORES);
    const i = lista.findIndex(b => b.id === id);
    if (i === -1) {
        return res.status(404).json({ error: "No existe este borrador guardado" });
    }
    lista[i] = { ...lista[i], ...req.body, hora: new Date().toISOString() };
    fs.writeFileSync(BORRADORES, JSON.stringify(lista, null, 2));
    res.json({ ok: true });
})

// Borrar un guardado 
app.delete("/api/borradores/:id", (req, res) => {
    const id = Number(req.params.id);
    const lista = leer(BORRADORES).filter(b => b.id !== id);
    fs.writeFileSync(BORRADORES, JSON.stringify(lista, null, 2));
    res.json({ ok: true });
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en el puerto: http://localhost:${PORT}`);
});


