import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;

const app = express();
app.use(cors());

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

app.get("/monitor_cucina", async (req, res) => {
  const stato = req.query.stato || "ordinato";
  const reparto = req.query.reparto || null;

  try {
    let query = "SELECT reparto, quantita, descrizione, ora, desc_tipologia FROM righe WHERE stato = $1";
    let params = [stato];

    if (reparto) {
      query += " AND reparto = $2";
      params.push(reparto);
    }

    const result = await pool.query(query, params);

    const data = result.rows.map(r => ({
      reparto: r.reparto,
      quantita_e_descrizioni: [{
        quantita: r.quantita,
        descrizione: r.descrizione,
        ora: r.ora,
        desc_tipologia: r.desc_tipologia
      }]
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella query" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API in ascolto su http://localhost:${PORT}`);
});



