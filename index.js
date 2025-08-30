import express from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// API untuk bikin shortlink
app.post("/api/shorten", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL wajib diisi" });

  const slug = nanoid(6);
  await pool.query("INSERT INTO links(slug, url) VALUES($1, $2)", [slug, url]);

  res.json({ short: `${req.protocol}://${req.get("host")}/${slug}` });
});

// Redirect
app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const result = await pool.query("SELECT url FROM links WHERE slug=$1", [slug]);

  if (result.rows.length === 0) return res.status(404).send("Link tidak ditemukan!");

  res.redirect(result.rows[0].url);
});

// Halaman utama (form input)
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Shortlink Kita 🚀</title></head>
      <body style="font-family:sans-serif;text-align:center;margin-top:50px;">
        <h1>🔗 Shortlink Railway</h1>
        <form id="form">
          <input type="url" id="url" placeholder="Masukkan URL..." style="padding:10px;width:300px;" required/>
          <button type="submit" style="padding:10px;margin-left:10px;">Shorten</button>
        </form>
        <p id="result"></p>
        <script>
          document.getElementById("form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const url = document.getElementById("url").value;
            const res = await fetch("/api/shorten", {
              method: "POST",
              headers: {"Content-Type":"application/json"},
              body: JSON.stringify({ url })
            });
            const data = await res.json();
            document.getElementById("result").innerHTML = "✅ Shortlink: <a href='" + data.short + "' target='_blank'>" + data.short + "</a>";
          });
        </script>
      </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`🚀 Server jalan di port ${PORT}`));
