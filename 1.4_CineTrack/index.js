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
// Useful for debugging: inspect all movies in the database.
/*
db.query("SELECT * FROM movies", (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.log(result.rows);
    }
});
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set EJS as the view engine
app.get("/", async (req, res) => {
    try{
        // 1. Get our personal movie collection from PostgreSQL
    const result = await db.query(`
        SELECT
            movies.title,
            movies.year,
            movies.rating,
            user_movies.watched
        FROM movies
        JOIN user_movies
            ON movies.id = user_movies.movie_id
        WHERE user_movies.watched = FALSE
        ORDER BY movies.rating DESC;
    `);

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

    if (!response.ok) {
        throw new Error("Could not fetch the featured movie from TMDB.");
    }

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
    }catch (err) {
        console.error("Error loading homepage:", err);
        res.status(500).send("Could not load CineTrack.");
    }
    
});

// Add a movie to the watchlist
app.post("/watchlist/add", async (req, res) => {
    const tmdbId = Number(req.body.tmdb_id);

    // 1. Validate the TMDB ID.
    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
        return res.status(400).send("Invalid TMDB movie ID.");
    }

    let transactionStarted = false;

    try {
        // 2. Fetch the movie's official details from TMDB.
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdbId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
                    accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            return res.status(400).send(
                "Could not find this movie on TMDB."
            );
        }

        const movie = await response.json();

        // 3. Start the database transaction.
        await db.query("BEGIN");
        transactionStarted = true;

        // 4. Check whether the movie already exists.
        const existingMovie = await db.query(
            "SELECT id FROM movies WHERE tmdb_id = $1",
            [tmdbId]
        );

        let movieId;

        if (existingMovie.rows.length === 0) {
            // 5. Insert the verified movie details.
            const newMovie = await db.query(
                `INSERT INTO movies
                    (tmdb_id, title, year, rating, poster_path)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [
                    tmdbId,
                    movie.title,
                    movie.release_date
                        ? Number(movie.release_date.slice(0, 4))
                        : null,
                    movie.vote_average,
                    movie.poster_path
                ]
            );

            movieId = newMovie.rows[0].id;
        } else {
            // Reuse the existing movie's database ID.
            movieId = existingMovie.rows[0].id;
        }

        // 6. Add the movie to the personal collection.
        await db.query(
            `INSERT INTO user_movies (movie_id, watched)
             VALUES ($1, FALSE)
             ON CONFLICT (movie_id) DO NOTHING`,
            [movieId]
        );

        // 7. Commit the transaction.
        await db.query("COMMIT");
        transactionStarted = false;

        // 8. Return to the homepage.
        res.redirect("/");

    } catch (err) {
        console.error("Error adding movie:", err);

        // Roll back if the transaction is still active.
        if (transactionStarted) {
            try {
                await db.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }

        res.status(500).send("Could not add movie.");
    }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});