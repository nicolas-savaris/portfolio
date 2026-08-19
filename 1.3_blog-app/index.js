const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req,res) => {
    res.render('index', { posts });
});

app.post('/post', (req, res) => {
    posts.push({
        title: req.body['post-title'],
        content: req.body['post-content']
    });

    res.redirect('/')
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