const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req,res) => {
    res.render('index', { posts });
});

app.post('/post', (req, res) => {
    // qui recupereremo i dati del form
    console.log(req.body['post-title']);
    console.log(req.body['post-content']);
    
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const posts = [
{
title: "My First Post",
content: "This is my first blog post!"
},
{
title: "Learning Node.js",
content: "I'm building my first blog application!©"
}
];