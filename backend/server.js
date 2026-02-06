const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// ✅ PORT CORRETA PARA RENDER
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "db.json");

// 🔥 SUPORTE A IMAGENS BASE64 GRANDES
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cors());

/* ===============================
   ROTA RAIZ (IMPORTANTE)
================================ */
app.get("/", (req, res) => {
  res.send("🚀 API de veículos rodando com sucesso!");
});

/* ===============================
   DB HELPERS
================================ */
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { vehicles: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }

  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return data ? JSON.parse(data) : { vehicles: [] };
  } catch (err) {
    console.error("❌ ERRO NO DB.JSON:", err);
    return { vehicles: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

/* ===============================
   ROTAS DE VEÍCULOS
================================ */

// GET todos
app.get("/vehicles", (req, res) => {
  const db = readDB();
  res.json(db.vehicles);
});

// POST criar
app.post("/vehicles", (req, res) => {
  const db = readDB();

  if (!req.body || !req.body.brand) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const vehicle = {
    ...req.body,
    id: Date.now()
  };

  db.vehicles.push(vehicle);
  saveDB(db);

  console.log("✅ VEÍCULO SALVO:", vehicle.id);
  res.status(201).json(vehicle);
});

// PUT editar
app.put("/vehicles/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);

  const index = db.vehicles.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Veículo não encontrado" });
  }

  db.vehicles[index] = { ...req.body, id };
  saveDB(db);

  console.log("✏️ VEÍCULO EDITADO:", id);
  res.json(db.vehicles[index]);
});

// DELETE remover
app.delete("/vehicles/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);

  db.vehicles = db.vehicles.filter(v => v.id !== id);
  saveDB(db);

  console.log("🗑 VEÍCULO REMOVIDO:", id);
  res.json({ success: true });
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚗 API rodando na porta ${PORT}`);
});
