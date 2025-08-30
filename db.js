import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway akan otomatis inject DATABASE_URL
  ssl: { rejectUnauthorized: false }
});

// Buat tabel jika belum ada
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(10) UNIQUE NOT NULL,
      url TEXT NOT NULL
    )
  `);
})();
