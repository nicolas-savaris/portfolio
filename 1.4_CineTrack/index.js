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

// Set EJS as the view engine
app.get("/", async (req, res) => {
    // 1. Get our personal movie collection from PostgreSQL
    const result = await db.query("SELECT * FROM movies");

    // Temporarily log the stats to the console
    const statsResult = await db.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (
                    WHERE user_movies.watched = TRUE
                ) AS watched,
                COUNT(*) FILTER (
                    WHERE user_movies.watched = FALSE
                ) AS watchlist
            FROM user_movies;
        `);

    console.log("MOVIE STATS:", statsResult.rows[0]);

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
        featuredMovie: featuredMovie,
        stats: statsResult.rows[0]
    });
});

// Add a movie to the watchlist
app.post("/watchlist/add", async (req, res) => {
    const tmdbId = Number(req.body.tmdb_id);

    //Validate the TMDB ID
    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
        return res.status(400).send("Invalid TMDB movie ID.");
    }

    try {
        // 1. Find the movie in our database
        const existingMovie = await db.query(
            "SELECT id FROM movies WHERE tmdb_id = $1",
            [tmdbId]
        );
        console.log(existingMovie.rows);

        let movieId;

        if (existingMovie.rows.length === 0) {
        // The movie isn't in our catalog yet.
        const newMovie = await db.query(
            `INSERT INTO movies
                (tmdb_id, title, year, rating, poster_path)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [
                tmdbId,
                req.body.title,
                Number(req.body.year),
                Number(req.body.rating),
                req.body.poster_path
            ]
        );

        movieId = newMovie.rows[0].id;
        console.log("New movie database ID:", movieId);

        } else {
        // We already have this movie.
        console.log("Movie already exists!");
        movieId = existingMovie.rows[0].id;
        }
        console.log("Movie ID to track:", movieId);
        // 2. Add a record to the user_movies table
        const trackingResult = await db.query(
            `INSERT INTO user_movies (movie_id, watched)
            VALUES ($1, FALSE)
            ON CONFLICT (movie_id) DO NOTHING
            RETURNING id`,
            [movieId]
        );

        console.log("Tracking record:", trackingResult.rows);


    // We'll add the insert logic next.
    } catch (err) {
        console.error("Error adding movie:", err);
        res.status(500).send("Could not add movie.");
    }
    res.redirect("/");
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});