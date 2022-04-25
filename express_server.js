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
    templateVars.user_id = users[user_id].id;
  return templateVars;
}

// function checkEmailExists(email) {
//   for (const ids in users) {
//     if (users[ids].email === email) return true;
//   }
//   return false;
// }

function checkLogin(email, password = "") {
  const output = {
    emailExists: false,
    passwordMatches: false,
  };
  for (const ids in users) {
    if (users[ids].email === email) {
      output.emailExists = true; // email matches
      if (password.length > 0) {
        if (users[ids].password === password) {
          output.passwordMatches = true;
          output.id = ids;
          return output;
        } else {
          return output;
        }
      }
      return output;
    }
  }
  return output;
}

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

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
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls/" + shortURL);
});

//generate string and add new post to /urls
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  if (req.cookies["user_id"] !== undefined) {
    urlDatabase[randomString] = {};
    urlDatabase[randomString].longURL = req.body.longURL;
    urlDatabase[randomString].userID = req.cookies.user_id;
  } else {
    return res.send("you have to be logged in to make a post");
  }
  console.log("urldatabase", urlDatabase);
  res.redirect("/urls/" + randomString);
});

//the short URL redirects you to the page specified in long url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(urlDatabase[shortURL] === undefined) return res.sendStatus("404");
  else res.redirect(urlDatabase[shortURL].longURL)
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[randomID] = {};
  const check = checkLogin(email);

  if (email.length === 0 || password.length === 0) return res.sendStatus(400);
  if (check.emailExists) return res.sendStatus(400);

  users[randomID].id = randomID;
  users[randomID].email = email;
  users[randomID].password = password;

  res.cookie("user_id", randomID);
  res.redirect("/urls");
});

//used to delete URLs from the /url list
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const check = checkLogin(email, password);
  if (check.passwordMatches) {
    res.cookie("user_id", check.id);
    res.redirect("/urls");
  } else {
    return res.sendStatus(403);
  }
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    users,
    user_id: user_id,
  };
  checkSignedIn(user_id, templateVars);
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"] === undefined) res.render("urls_login");
  res.render("urls_new");
});

//links to the show page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies["user_id"];
  const templateVars = {
    users,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
  };
  checkSignedIn(user_id, templateVars);
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
