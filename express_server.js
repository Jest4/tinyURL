var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.post("/urls", (req, res) => {
  let newURL = generateRandomString()
  if (req.body.longURL.includes("http://")) {
  urlDatabase[newURL] = req.body.longURL
} else {
  urlDatabase[newURL] = "http://" + req.body.longURL
}
  console.log("created", newURL, ": ", req.body.longURL);  // debug statement to see POST parameters
  res.redirect("urls/" + newURL);         // Respond with 'Ok' (we will replace this)
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});