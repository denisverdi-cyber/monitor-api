const result = await pool.query(
  `SELECT 
    o.reparto,
    o.ora,
    o.desc_tipologia,
    r.descrizione,
    SUM(r.quantita) AS quantita
FROM ordini o
JOIN righe r ON o.id = r.id_ordine
WHERE o.stato = 'ordinato'
GROUP BY o.reparto, o.ora, o.desc_tipologia, r.descrizione
ORDER BY o.ora ASC`,
  [stato]
);

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

const response = Object.keys(grouped).map(rep => ({
  reparto: rep,
  quantita_e_descrizioni: grouped[rep]
}));

res.json(response);
