var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var users = {
  "uid01" : {
        id : "uid01",
        email : "user@email.com",
        password : "passwordo"
  },
  "uid01" : {
        id : "uid02",
        email : "auser@email.com",
        password : "123456"
  },
  "uid01" : {
        id : "uid02",
        email : "buser@email.com",
        password : "pw123"
  }
}

function generateRandomString() {
  let newString = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    newString += possible.charAt(Math.floor(Math.random() * possible.length));
  return newString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {   username: req.cookies["username"], urls: urlDatabase , };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {   username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {  username: req.cookies["username"], shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  let templateVars = {  username: req.cookies["username"], greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {   username: req.cookies["username"]}
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let newID = generateRandomString()
  let uid = users.newID
  uid = {}
  uid.id = newID
  uid.email = req.body.email
  console.log(uid)
  res.cookie("user_id", newID)
  res.redirect("/urls/");
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString()
  if (req.body.longURL.includes("http://")) {
  urlDatabase[newURL] = req.body.longURL
} else {
  urlDatabase[newURL] = "http://" + req.body.longURL
}
  console.log("created", newURL, ": ", req.body.longURL);  // debug statement to see POST parameters
  res.redirect("urls/" + newURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id
  delete urlDatabase[shortURL]
  res.redirect("/urls/");
});

app.post("/urls/:id/", (req, res) => {
  let longURL = req.body.longURL
  let shortURL = req.params.id
  urlDatabase[shortURL] = [longURL]
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});