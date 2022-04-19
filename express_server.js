const { Template } = require("ejs");
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(cookieParser())

function generateRandomString() {
  let result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < 6; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {username: req.cookies['username'], urls: urlDatabase }
  // const templateVars = {urls: urlDatabase }

  res.render("urls_index", templateVars)
});

//cookie stores username

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username',req.body.username)
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
  res.redirect("/urls/" + shortURL);
});


//links to the show page
app.get("/urls/:shortURL", (req, res) => {
  // console.log('its doggo time')
  const shortURL = req.params.shortURL
  const templateVars = {username: req.cookies["username"], shortURL: shortURL, longURL: urlDatabase[shortURL] };  
  // const templateVars = {shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});



//used to delete URLs from the /url list
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params)
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls/");

});

//generate string and add new post to /urls
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls/" + shortURL);
});


//the short URL redirects you to the page specified in long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});