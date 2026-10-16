const express = require("express");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs")

const app = express();
const PORT = 3000;
const ARCHIVO = path.join(__dirname, "data", "registros.json");
const MANOS = path.join(__dirname, "data", "chequeo.json");

app.use(express.json());

// Recarga en vivo: solo con "npm run dev" (pasa --dev). Al guardar algo en public/ el navegador se actualiza solo.
if (process.argv.includes("--dev")) {
    const livereload = require("livereload");
    const connectLivereload = require("connect-livereload");
    livereload.createServer({ exts: ["html", "css", "js"] }).watch(path.join(__dirname, "public"));
    app.use(connectLivereload({ ignore: [/^\/api\//] }));
}

app.use(express.static(path.join(__dirname, "public")));


// descargar todos los chequeos en un excel 

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
    lista.push({ id: Date.now(), hora: new Date().toISOString(), ...nuevo });
    fs.writeFileSync(archivo, JSON.stringify(lista, null, 2));
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

    if(encontrados.length === 0){
        return res.status(404).send("No Existe ese registro");
    };

    await enviarExel(res, encontrados,`lavado-${id}.xlsx`);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en el puerto: http://localhost:${PORT}`);
});


