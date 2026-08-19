const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;



app.set('view engine', 'ejs');


// Middleware to parse JSON requests
app.use(express.json());

// Sample route
/*app.get('/', (req, res) => {
    res.render('index');
    
});
*/
app.get('/', (req,res) => {
    res.render('index', { posts });
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