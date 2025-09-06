import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 3000;

// Connessione Neon.tech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // oppure metti qui direttamente la stringa
  ssl: { rejectUnauthorized: false }
});

app.use(cors());

// Endpoint monitor cucina
app.get("/monitor_cucina", async (req, res) => {
  const stato = req.query.stato || "ordinato";

  try {
    const result = await pool.query(
      `SELECT 
          o.reparto,
          MIN(o.ora) AS ora,
          t.descrizione AS desc_tipologia,
          r.descrizione,
          SUM(r.quantita) AS quantita
       FROM ordini o
       JOIN righe r ON o.id = r.id_ordine
       JOIN articoli a ON r.type = a.id
       JOIN tipologie t ON a.id_tipologia = t.id
       WHERE o.stato = $1
       GROUP BY o.reparto, t.descrizione, r.descrizione
       ORDER BY MIN(o.ora) ASC`,
      [stato]
    );

    // Raggruppa i dati per reparto
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.reparto]) {
        grouped[row.reparto] = [];
      }
      grouped[row.reparto].push({
        quantita: row.quantita,
        descrizione: row.descrizione,
        ora: row.ora,
        desc_tipologia: row.desc_tipologia
      });
    });

    // Trasforma in array per il frontend
    const response = Object.keys(grouped).map(rep => ({
      reparto: rep,
      quantita_e_descrizioni: grouped[rep]
    }));

    res.json(response);
  } catch (err) {
    console.error("Errore qu
