const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["el secreto en espanglish"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));

var urlDatabase = {
  "b2xVn2" : {longURL : "http://www.lighthouselabs.ca", userID: "uid01", created: 'Before Time Existed', count: 0, uCount: 0, viewed: {}},
  "9sm5xK" : {longURL : "http://www.google.com", userID: "uid03", created: 'Before Time Existed', count: 0, uCount: 0, viewed: {}}
};

var users = {
  "uid01" : {
        id : "uid01",
        email : "user@email.com",
        password : "$2b$15$11HlRIyMZVNlnSFJ9DllyOYrd.d5P0wx39VTu952ZsPfcj5gN/y.y"
  },
  "uid02" : {
        id : "uid02",
        email : "auser@email.com",
        password : "$2b$15$RhCQX/77p/apEDD13EBJ9uoJTQV8YaAPn7ci74ExOSw6/0ZubNyju"
  },
  "uid03" : {
        id : "uid03",
        email : "buser@email.com",
        password : "$2b$15$kOu8PK/nBXuOFcHeKDa0E.TmYk0v98SkwdOZxNensnJ0JdvoUTCbe"
  }
};

//creates strings for user IDs and shortened links
function generateRandomString() {
  let newString = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    newString += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  if ((users[newString]) || (urlDatabase[newString])) {
    generateRandomString();
  } else {
    return newString;
  }
}

function attemptLogin(req, res) {
  for (let user in users) {
    if ((users[user].email == req.body.email) && (bcrypt.compareSync(req.body.password, users[user].password))) {
      console.log("Successful login: ", users[user].id, users[user].email);
      return users[user].id;
    }
  }
  res.status(403).send("Authentication failed");
  return null;
}

function attemptRegister(req) {
  //check if email already exists in user db
  for (let user in users) {
    if (users[user].email == req.body.email) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  let urls = {};
  for (let site in urlDatabase) {
    if (urlDatabase[site].userID == id) {
      urls[site] = urlDatabase[site];
    }
  }
  return urls;
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let uid = req.session.user_id;
  if (users[uid]) {
    let templateVars = {user_id: users[req.session.user_id], urls: urlsForUser(uid)};
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = {user_id: users[req.session.user_id], urls: urlDatabase};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login/");
  }
});

app.get("/login", (req, res) => {
  let uid = req.session.user_id;
  let templateVars = {user_id: users[req.session.user_id]};
  if (users[uid]) {
    res.redirect("/urls/");
  } else {
    res.render("login", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send(" ERROR 404 : That page does not exist.");
  } else {
    let templateVars = {user_id: users[req.session.user_id], shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, dbInfo: urlDatabase[req.params.id]};
    if (req.session.user_id == urlDatabase[shortURL].userID) {
      res.render("urls_show", templateVars);
    } else {
      res.status(403).send("You are not authorized to alter that shortcut.");
    }
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (urlDatabase[req.params.shortURL]) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    // analytics -- checking for/setting vistor cookie & adding to appropriate counters
    if (!req.session.visitor_ID) {
      req.session.visitor_ID = generateRandomString();
    }
    let vid = req.session.visitor_ID;
    if (!urlDatabase[shortURL].viewed[vid]) {
      urlDatabase[shortURL].uCount++;
      urlDatabase[shortURL].viewed[vid] = [new Date()];
    } else {
      urlDatabase[shortURL].viewed[vid].push(new Date());
    }
    urlDatabase[shortURL].count++;
    res.redirect(longURL);
  } else {
    res.status(404).send(" ERROR 404 : That shortcut does not exist.");
  }
});

app.get("/register", (req, res) => {
  let uid = req.session.user_id;
  let templateVars = {user_id: users[req.session.user_id]};
  if (users[uid]) {
    res.redirect("/urls/");
  } else {
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  if ((req.body.email === "") || (req.body.password === "")) {
    res.status(400).send("Password and Email fields cannot be left blank.");
  }
  // check if email exists in db
  if (attemptRegister(req, res) === true) {
    res.status(400).send("That email address has already been used.");
  } else {
    // if clear -- register a new user
    let newID = generateRandomString();
    users[newID] = {};
    users[newID].id = newID;
    users[newID].email = req.body.email;
    users[newID].password = bcrypt.hashSync(req.body.password, 15);
    req.session.user_id = newID;
    console.log("New User ", users[newID]);
    res.redirect("/urls/");
  }
});

app.post("/urls", (req, res) => {
  // Check user_id
  let uid = req.session.user_id;
  if (users[uid]) {
  // Create New Link
    let newURL = generateRandomString();
    urlDatabase[newURL] = {userID : req.session.user_id, created: new Date(), count : 0, uCount : 0, viewed: {}};
    if (req.body.longURL.includes("http://")) {
      urlDatabase[newURL].longURL = req.body.longURL;
    } else {
      urlDatabase[newURL].longURL = "http://" + req.body.longURL;
    }
    console.log("new Link", newURL, urlDatabase[newURL]);
    res.redirect("urls/" + newURL);
    } else {
    res.status(403).send("Please Login first.");
  }
});

app.delete("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send(" ERROR 404 : That page does not exist.");
  } else if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls/");
  } else {
    if (req.session.user_id === undefined) {
      res.status(403).send("Please Login first.");
    } else {
      res.status(403).send("You may not alter another User's shortcuts.");
    }
  }
});

app.put("/urls/:id/", (req, res) => {
  // Edit Link
  let longURL = req.body.longURL;
  let shortURL = req.params.id;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = [longURL];
    res.redirect("/urls/");
  } else {
    res.status(403).send("You may not alter that shortcut.");
  }
});

app.post("/login", (req, res) => {
  //check database for email match
  let uid = attemptLogin(req, res);
  // set cookie if login successful
  if (uid !== null) {
    req.session.user_id = uid;
    res.redirect("/urls/");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});