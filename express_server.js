const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const { generateRandomString, filterDatabase, checkLogin } = require("./helpers.js");

app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

//database that belongs to the user
const urlDatabase = {
  sqq3y6: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//user data 
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "dog",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

//updates urls; edit button on /urls
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  if (user_id === urlDatabase[shortURL].userID)
    urlDatabase[shortURL].longURL = longURL;
  else return res.sendStatus(403);
  res.redirect("/urls/" + shortURL);
});

//generate string and add new post to /urls, the submit button on the 'create new url' page
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const randomString = generateRandomString();
  if (user_id !== undefined) {
    urlDatabase[randomString] = {};
    urlDatabase[randomString].longURL = req.body.longURL;
    urlDatabase[randomString].userID = user_id;
  } else {
    return res.send("you have to be logged in to make a post");
  }
  res.redirect("/urls/" + randomString);
});

//the short URL redirects you to the page specified in long url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) return res.sendStatus("404");
  else res.redirect(urlDatabase[shortURL].longURL);
});

//used for registering new users
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[randomID] = {};
  const check = checkLogin(email, password, users);

  if (email.length === 0 || password.length === 0) return res.sendStatus(400);
  if (check.emailExists) return res.sendStatus(400);

  users[randomID].id = randomID;
  users[randomID].email = email;
  users[randomID].password = hashedPassword;

  req.session.user_id = randomID;
  // res.cookie("user_id", randomID);
  res.redirect("/urls");
});

//used to delete URLs from the /url list
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (user_id === urlDatabase[shortURL].userID) delete urlDatabase[shortURL];
  else return res.sendStatus(403);
  res.redirect("/urls/");
});

//removes the cookies from the browsers on log out
app.post("/logout", (req, res) => {
  res.clearCookie("session.sig");
  res.clearCookie("session");
  res.redirect("/urls");
});

//login button on the log in page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const check = checkLogin(email, password, users);
  if (check.passwordMatches) {
    req.session.user_id = check.id;
    res.redirect("/urls");
  } else {
    return res.sendStatus(403);
  }
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const filteredDatabase = filterDatabase(user_id, urlDatabase);
  const templateVars = {
    urls: filteredDatabase,
    users,
    user_id: user_id,
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id === undefined) res.render("urls_login");
  const templateVars = {
    users,
    user_id: user_id,
  };
  res.render("urls_new", templateVars);
});

//links to the show page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  if (user_id === undefined) return res.sendStatus(403);
  if (urlDatabase[shortURL] === undefined) return res.sendStatus(404);

  const templateVars = {
    users,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user_id:user_id
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
