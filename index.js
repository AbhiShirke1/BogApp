const express = require("express");
const db = require('./queries');
// const { query } = require("express");
const cookies = require("cookie-parser");

const bodyParser = require('body-parser')
const app = express();
const port = 8000; 


app.use(bodyParser.json())
app.use(express.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  }) 
);
app.use(cookies())

 
app.get("/h", (req, res)=>{
  res.cookie("c", "hello");
  res.send("hello");
})
app.get('/', (req, res) => {
  console.log(req.cookies);
    res.json({ info: 'Node.js, Express, and Postgres API' })
});


app.post('/api/signup', db.register);
app.post('/api/login', db.login);


// app.get('/api/users/:id', db.getUserById)
// app.get('/api/users', db.getUsers)
// app.post('/users', db.createUser)
// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)

app.post("/api/posts", db.createPost)
app.get("/api/posts", db.getPost)
app.put("/api/posts/:id", db.editPost)
app.delete("/api/posts/:id", db.deletePost)
app.post("/api/comments/:id", db.postComments)
app.get("/api/comments", db.allComments)
app.get("/api/comments/:id", db.getCommentById)
app.put("/api/comments/:id", db.editComment)
app.delete("/api/comments/:id", db.deleteComment)
app.post("/api/like/:id", db.likePost)
app.post("/api/dislike/:id", db.dislikePost)


app.listen(port, ()=>{
    console.log(`App running on port ${port}`);
})