import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();

const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

db.connect();

db.query("SELECT * FROM movies", (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.log(result.rows);
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM movies");
    res.render("index.ejs",
        {movies: result.rows}
    )
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});