app.get("/testdb", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
