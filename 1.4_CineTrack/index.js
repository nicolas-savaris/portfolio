import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();


const response = await fetch(
    "https://api.themoviedb.org/3/search/movie?query=The%20Dark%20Knight",
    {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
            accept: "application/json"
        }
    }
);

const data = await response.json();
const featuredMovie = data.results[0];

console.log(data.results[0].poster_path);


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
    // 1. Get our personal movie collection from PostgreSQL
    const result = await db.query("SELECT * FROM movies");

    // 2. Fetch a movie from TMDB
    const response = await fetch(
        "https://api.themoviedb.org/3/search/movie?query=The%20Dark%20Knight",
        {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
                accept: "application/json"
            }
        }
    );

    const data = await response.json();
    const featuredMovie = data.results[0];

    console.log("Featured movie:", featuredMovie.title);
    console.log("Poster path:", featuredMovie.poster_path);
    // 3. Send both datasets to EJS
    res.render("index.ejs", {
        movies: result.rows,
        featuredMovie: featuredMovie
    });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});