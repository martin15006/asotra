const express = require("express");
const fs = require("fs");
const path = require("path");

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
    app.use(connectLivereload());
}

app.use(express.static(path.join(__dirname, "public")));

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



app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor en el puerto: http://localhost:${PORT}`);
});


