const { Template } = require("ejs");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const { redirect, status } = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}

function checkSignedIn(user_id, templateVars) {
  if (typeof users[user_id] !== "undefined")
    templateVars.username = users[user_id].email;
  return templateVars;
}

function checkEmailExists(email) {
  for (const ids in users) {
    console.log(users[ids].email);
    if (users[ids].email === email) return true;
  }
  return false;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

app.get("/register", (req, res) => {
  const templateVars = { isRegister: true };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  
  const randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[randomID] = {};

  if (email.length === 0 || password.length === 0) return res.sendStatus(400);
  if (checkEmailExists(email)) return res.sendStatus(400);

  users[randomID].id = randomID;
  users[randomID].email = email;
  users[randomID].password = password;

  res.cookie("user_id", randomID);
  res.cookie("username", email);
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
  };
  checkSignedIn(user_id, templateVars);
  res.render("urls_index", templateVars);
});

//cookie stores username

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//updates urls
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/" + shortURL);
});

//links to the show page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies["user_id"];
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
  };
  checkSignedIn(user_id, templateVars);
  res.render("urls_show", templateVars);
});

//used to delete URLs from the /url list
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

//generate string and add new post to /urls
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

//the short URL redirects you to the page specified in long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
