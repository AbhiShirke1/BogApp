const pool = require('./config/db.config');
// const pools = require('./config/db.config');
const cookies = require("cookie-parser");
const bodyParser = require('body-parser')
const express = require("express")
const app = express();

// app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookies())

const register = async (req, res) => {
  const { name, email, phonenumber, password } = req.body;
  const data = await pool.query(`SELECT * FROM auth WHERE email= $1;`, [email]);
  const ar = data.rows;

  try {

    if (!name || !email || !phonenumber || !password) {
      return res.status(400).send("Please fill all the details.");
    }

    if (ar.length != 0) {
      return res.status(400).send(
        "Emaily is already registered"
      );
    }

    else {
      const user = {
        name,
        email,
        phonenumber,
        password
      };

      var flag = 1;

      pool.query(`INSERT INTO auth (name, email, phonenumber, password) VALUES ($1,$2,$3,$4);`, [user.name, user.email, user.phonenumber, user.password],
        (err) => {
          if (err) {
            flag = 0;
            console.log(err);
            return res.status(500).send("Database error")
          }

          else {
            flag = 1;
            res.status(200).send("User added to the database");
          }
        }
      )
    }

  } catch (error) {
    console.log(error);
    res.status(500).send("Db error while registration");
  }
}

const login = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await pool.query(`SELECT * FROM auth WHERE email= $1;`, [email]);
  const user = data.rows;


  try {
    if (user.length === 0) {
      res.status(400).send("User is not registered, Sign Up first");

    }

    else {
      const a1 = password;
      const a2 = user[0].password;
      if (a1 === a2 && name === user[0].name && email === user[0].email) {
        res.cookie("log", "yes");
        res.cookie('email', email);
        // console.log(req.cookies);
        return res.status(200).send("Logged in successfully");
      }


      else {
        return res.status(400).send("Invalid credentials");
      }
    }

  } catch (error) {
    console.log(error);
    res.status(500).send("Db error while logging");
  }
}


let id = 0;

const createPost = async(req, res) => {
  const c = req.cookies.log;
  var email;


  if (c == "yes") {
    email = req.cookies.email;
   
    const { content, category, keywords, created, title, user } = req.body;
    id=id+1;
    pool.query('INSERT INTO lad (likes, dislikes, identity) values($1, $2, $3)', [0, 0, id], (error, results)=>{
      if(error) throw error;  
    })

    pool.query('INSERT INTO blog (content, category, keywords, created, title, email, username) VALUES ($1, $2, $3, $4, $5, $6, $7)', [content, category, keywords, created, title, email, user], (error, results) => {
      if (error) {
        throw error
      }
      return res.status(201).send(`Data added into the database`)
    })

  }

  else {
    return res.send("Login first")
  }

  
}


const getPost = (req, res) => {
  const c = req.cookies.log;
  var email;


  if (c == "yes") {
    const { keywords, search, category, user } = req.body;

    const ar = pool.query('select content from blog', (error, results)=>{
      if(error){
        throw error;
      }

      res.status(200).json(results.rows)
    })
    // pool.query('SELECT content from blog where keywords like $1', ['%' + keywords + '%']),
    // pool.query('SELECT content from blog where content like $1', ['%' + search + '%']),
    // pool.query('select category from blog where category = $1', [category]),
    // pool.query('select content from blog where username = $1', [user])
    // ]




    // pool.query('select content from blog', (error, results)=>{
    //   if(error) console.log(error);

    //   return res.send(results)
    // }); 
    

    // if(keywords)
    // pool.query('SELECT content from blog where keywords like $1', ['%' + keywords + '%'], (error, results)=>{
    //   if(error) console.log(error);

    //   return res.send(results)
    // });


  }
}

const editPost = (req, res) => {
  const c = req.cookies.log;
  var email;

  if (c == 'yes') { 
    const id = parseInt(req.params.id)
    const { content, category, keywords, created, title } = req.body

    pool.query(
      'UPDATE blog SET content = $1, category = $2, keywords = $3, created = $4, title = $5 WHERE id = $6', [ content, category, keywords, created, title, id], 
      (error, results) => {
        if (error) {
          throw error
        }
        res.status(200).send(`User modified with ID: ${id}`)
      }
    )
  }
}

const deletePost = (req, res)=>{
  const c = req.cookies.log;
  var email;
 
  if(c=='yes'){
    const id = parseInt(req.params.id)


    pool.query('DELETE FROM blog WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      res.status(200).send(`User deleted with ID: ${id}`)
    })
  }
}

const postComments = (req, res)=>{
  const c = req.cookies.log;
  var email;

  if(c == 'yes'){
    email = req.cookies.email;
    const comment = req.body.comment;
    const id = parseInt(req.params.id);

    pool.query('INSERT INTO comments (comment, whose, identity) values ($1, $2, $3)', [comment, email, id], (error, results)=>{
      if(error){
        throw error
      }

      res.status(200).send("Comment added");
    })
  }
}

const allComments = (req, res)=>{
  const c = req.cookies.log;
  var email;

  if(c=='yes'){
    pool.query('Select comment from comments', (error, results)=>{
      if(error)
      throw error;

      res.json(results.rows)
    })
  }
}

const getCommentById = (req, res)=>{
  const c = req.cookies.log;
  var email;

  if(c=='yes'){
    const id = parseInt(req.params.id);

    pool.query('select comment from comments where identity = $1', [id], (error, results)=>{
      if(error){
        throw error
      }

      res.status(200).json(results.rows[0]);
    })
  }
}

const editComment = (req, res)=>{
  const c = req.cookies.log;
  var email;

  if(c=='yes'){
    const comment = req.body.comment;
    const id = parseInt(req.params.id);

    pool.query('update comments set comment = $1  where identity = $2', [comment, id], (error, results)=>{
      if(error)
      throw error;

      res.status(200).send("updated")
    })
  }
}

const deleteComment = (req, res)=>{
  const c = req.cookies.log;
  var email;

  if(c=='yes'){
    const id = req.params.id;

    pool.query('DELETE FROM comments WHERE identity = $1', [id], (error, results)=>{
      if(error){
        throw error;
      }

      res.status(200).send("Comment deleted");
    })
  }
}

const likePost = (req, res)=>{
  const c = req.cookies.log;
  var email;

  if(c=='yes'){
    const id = req.params.id;

    pool.query('UPDATE lad SET likes = likes + 1 where identity = $1', [id], (error, results)=>{
      if(error){
        throw error;
      }

      res.status(200).send("Post liked");
    })
  }
}

const dislikePost = (req, res)=>{
  const c = req.cookies.log;
  var email;

  if(c=='yes'){
    const id = req.params.id;

    pool.query('UPDATE lad SET dislikes = dislikes + 1 where identity = $1', [id], (error, results)=>{
      if(error){
        throw error;
      }

      res.status(200).send("Post disliked");
    })
  }
}



module.exports = {
  register,
  login,
  createPost,
  getPost,
  editPost,
  deletePost,
  postComments,
  allComments,
  getCommentById,
  editComment,
  deleteComment,
  likePost,
  dislikePost
}