const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 8080;

const serviceAccount = require("./../config/serviceAccountKey.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

const functions = require("firebase-functions");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/static", express.static("static/"));



// use res.render to load up an ejs view file
// index page
app.get("/", async function (req, res) {
  const url = 'https://shazam.p.rapidapi.com/songs/list-recommendations?key=484129036&locale=en-US';
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
      'X-RapidAPI-Key': '577dc0b40bmsh6ea6fa79b9105aep161387jsn5ee36599a5f6'
    }
  };
  const message = await fetch(url, options);
  const m = await message.json();
  const music = Object.values(m.tracks);
  res.render("pages/index", { data: music });
  
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
  const url = 'https://shazam.p.rapidapi.com/songs/list-artist-top-tracks?id=40008598&locale=en-US';
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
      'X-RapidAPI-Key': '577dc0b40bmsh6ea6fa79b9105aep161387jsn5ee36599a5f6'
    }
  };
  const message = await fetch(url, options);
  const m = await message.json();
  const music = Object.values(m.tracks);
  // console.log(music);
  res.render("pages/dashboard", { data : music });
});

// app.get("/afterlogin", function (req, res) {
//     res.render("pages/afterlogin");
// });

app.post("/sessionLogin", async (req, res) => {
  const idToken = req.body.idToken;
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin.auth().createSessionCookie(idToken, { expiresIn })
    .then(
      sessionCookie => {
        const options = { maxAge: expiresIn, httpOnly: true};
        res.cookie("session", sessionCookie, options);
        res.status(200).send(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send(error.toString());
      }
    );

});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/sign-in");
});

app.post("/dog-messages", authMiddleware, async (req, res) => {
  await userFeed.add(req.user, req.body.message);
  res.redirect("/dashboard");
});



// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest(app);


app.listen(port);
console.log("Server started at http://localhost:" + port);
