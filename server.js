const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const ARCHIVO = path.join(__dirname, "data", "registros.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function leerRegistros() {
    try {
        return JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
    } catch {
        return [];
    }
}

app.get("/api/formularios", (req, res) => {
    res.json(leerRegistros());
});


app.post("/api/formularios", (req, res) => {
    const registros = leerRegistros();
    registros.push({ id: Date.now(), ...req.body });
    fs.writeFileSync(ARCHIVO, JSON.stringify(registros, null, 2));
    res.status(201).json({ ok: true });
});

app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`Servidor en el puerto: http://localhost:${PORT}`);
});


