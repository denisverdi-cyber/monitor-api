import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 3000;

// Configura connessione Neon.tech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // oppure copia direttamente la stringa da Neon
  ssl: { rejectUnauthorized: false }
});

app.use(cors());

// Endpoint monitor cucina
app.get("/monitor_cucina", async (req, res) => {
  const stato = req.query.stato || "ordinato";

  try {
    const result = await pool.query(
      `SELECT 
         o.id AS id_ordine,
         o.reparto,
         o.ora,
         r.quantita,
         r.descrizione,
         o.desc_tipologia
       FROM ordini o
       JOIN righe r ON o.id = r.id_ordine
       WHERE o.stato = $1
       ORDER BY o.ora ASC`,
      [stato]
    );

    // Raggruppa per reparto
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

    // Trasforma in array
    const response = Object.keys(grouped).map(rep => ({
      reparto: rep,
      quantita_e_descrizioni: grouped[rep]
    }));

    res.json(response);
  } catch (err) {
    console.error("Errore query:", err);
    res.status(500).json({ error: "Errore interno al server" });
  }
});

// Avvio server
app.listen(port, () => {
  console.log(`✅ Server attivo su http://localhost:${port}`);
});
