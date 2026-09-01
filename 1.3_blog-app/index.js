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

app.get("/post/:id", (req, res) => {
    const id = req.params.id;
    const post = posts[id];
    
    res.render("post", { post });
});

app.post('/post', (req, res) => {
    const currentDate = new date();
    posts.push({
        title: req.body['post-title'],
        content: req.body['post-content'],
        date: currentDate.toLocaleDateString("it-IT")
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
        content: "This is my first blog post!",
        date: "September 1, 2026"
    },
    {
        title: "Learning Node.js",
        content: " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ut maximus urna. Suspendisse id nibh in libero venenatis venenatis vitae a lorem. Nulla facilisi. Praesent scelerisque varius lacus, eget pharetra erat dapibus id. Nam risus augue, aliquet et tempor id, condimentum at turpis. Suspendisse iaculis sem in vehicula varius. Proin ac ligula ut orci molestie posuere quis nec erat. Nam lobortis, lectus et dapibus suscipit, massa arcu gravida ligula, in ultrices lorem nunc vitae libero. Phasellus purus metus, rutrum eget faucibus at, tristique mattis erat. Donec eleifend malesuada diam, a maximus tortor pretium id. Cras ac ante sed mauris hendrerit euismod. Fusce elementum massa sit amet eleifend ultricies. Aliquam nec ex a nisl rhoncus placerat id non quam. Fusce eleifend venenatis tortor, vel viverra turpis sollicitudin in. Vivamus porttitor sodales ipsum vitae aliquam. Integer iaculis faucibus fermentum. Suspendisse risus orci, dictum gravida viverra vel, ultrices nec tortor. Phasellus id ante non velit congue scelerisque vitae vel leo. Vestibulum sollicitudin urna non nisl ultrices fringilla. Pellentesque lacinia at ante vitae finibus. Phasellus lectus felis, lobortis a ultrices a, imperdiet id urna. Nam sit amet vehicula leo. In laoreet varius tellus sit amet egestas. Nullam commodo commodo risus vel efficitur. Nulla ex. ",
        date: "September 1, 2026"
    }
];