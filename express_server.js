var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

var urlDatabase = {
   "b2xVn2" : { longURL : "http://www.lighthouselabs.ca", userID: "uid01" },
   "9sm5xK" : { longURL : "http://www.google.com", userID: "uid03" }
};

var users = {
  "uid01" : {
        id : "uid01",
        email : "user@email.com",
        password : "passwordo"
  },
  "uid02" : {
        id : "uid02",
        email : "auser@email.com",
        password : "123456"
  },
  "uid03" : {
        id : "uid03",
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

function attemptLogin(req, res) {
  for (var user in users) {
    let found = 0;
    if ((users[user].email == req.body.email) && (req.body.password == users[user].password)) {
      console.log("MATCH FOUND", users[user].id, users[user].email)
      found = 1;
      return users[user].id;
    }
  }
  res.status(403).send("Authentication failed")
  console.log("no match")
  return null;
}

function attemptRegister(req, res) {
  //check if email is unique in db
  for (var user in users) {
    if (users[user].email == req.body.email) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  let urls = {}
  for (let site in urlDatabase) {
    if (urlDatabase[site].userID == id){
      urls[site] = urlDatabase[site]
    }
  }
  return urls
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let uid = req.cookies.user_id
  if (uid != undefined) {
    console.log("Logged in as", uid)

  let templateVars = {   user_id: users[req.cookies.user_id], urls: urlsForUser(uid) };
  res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id != undefined) {
  let templateVars = {urls: urlDatabase}
  res.render("urls_new", templateVars);
} else {
  let templateVars = {   user_id: users[req.cookies.user_id]}
  res.redirect("/login/")
}
});

app.get("/login", (req, res) => {
  let templateVars = {   user_id: users[req.cookies.user_id]}
  res.render("login", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {  user_id: users[req.cookies.user_id], shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  let templateVars = {  user_id: users[req.cookies.user_id], greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {   user_id: users[req.cookies.user_id]}
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  // check if email exists in db
if ((req.body.email == "") || (req.body.password == "")) {
  res.status(400).send("Password and Email fields cannot be left blank.")
}
if (attemptRegister(req, res) == true) {
  res.status(400).send("That email address has already been used.")
} else {
  // if clear
  let newID = generateRandomString()
  users[newID] = {}
  users[newID].id = newID
  users[newID].email = req.body.email
  users[newID].password = req.body.password
  res.cookie("user_id", newID)
  res.redirect("/urls/");
}
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString()
  urlDatabase[newURL] = {userID : req.body.email}
  if (req.body.longURL.includes("http://")) {
    urlDatabase[newURL].longURL = req.body.longURL
  } else {
    urlDatabase[newURL].longURL = "http://" + req.body.longURL
  }
  console.log("created", newURL, ": ", req.body.longURL);  // debug statement to see POST parameters
  res.redirect("urls/" + newURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id
  if (req.cookies.user_id == urlDatabase[shortURL].userID){
  delete urlDatabase[shortURL]
  res.redirect("/urls/");
  } else {
  res.status(403).send("You may not alter that shortcut.")
  }
});

app.post("/urls/:id/", (req, res) => {
  let longURL = req.body.longURL
  let shortURL = req.params.id
  // debug console.log("ShortURL =", shortURL, "LongURL =", longURL, "Logged in =", req.cookies.user_id, "Link Owner =", urlDatabase[shortURL].userID)
  if (req.cookies.user_id == urlDatabase[shortURL].userID){
  urlDatabase[shortURL].longURL = [longURL]
  res.redirect("/urls/");
  } else {
  res.status(403).send("You may not alter that shortcut.")
  }
});

app.post("/login", (req, res) => {
  //check database for email match
  let uid = attemptLogin(req, res)
  // set cookie if login successful
  if (uid != null) {
  res.cookie("user_id", uid)
  res.redirect("/urls/");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});