const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedpw = await bcrypt.hash(request.body.password, 10);
  console.log(hashedpw);
  const query = `select * from user where username='${username}'`;
  const dbuser = await db.get(query);

  if (dbuser === undefined) {
    const createu = `insert into user (username,name,password,gender)
      values (
        '${username}',
      '${name}',
      '${hashedpw}',
      '${gender}',
      '${location}')`;

    const result = await db.run(createu);

    response.send("created created");
  } else {
    response.status(400);
    response.send("user already exist");
  }
});
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  console.log(password);
  const user = `select * from user 
    where username='${username}'`;
  const resultuser = await db.get(user);
  console.log(user.password);
  console.log(resultuser.password);
  if (resultuser === undefined) {
    response.status(400);
    response.send("user invalid");
  } else {
    const ispassword = await bcrypt.compare(password, resultuser.password);
    if (ispassword === true) {
      const payload = { username: username };
      //const jwtoken = jwt.sign(payload, "apple");
      //response.send(jwtoken);
      response.send("login sucess");
    } else {
      response.send("invalid password");
    }
  }
});
