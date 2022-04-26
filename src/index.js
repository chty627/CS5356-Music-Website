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

const {initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, doc, getDoc, setDoc} = require('firebase-admin/firestore');



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
  const musics = Object.values(m.tracks);

  const db = admin.firestore();
  const user = await admin.auth().verifySessionCookie(req.cookies.session, true);
  if(user){
    const email = user.email;
    var music_user = db.collection('users').doc(email);
    const data_for_user = await music_user.get();
    let music_for_user = []
    if (data_for_user.data()) {music_for_user = data_for_user.data().musics;}

      // add heart
    for(var i = 0; i < musics.length; i++){
      musics[i]["heart"] =  music_for_user.includes(musics[i].key);
    }
  }
  res.render("pages/index", { data: musics });
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/dashboard", authMiddleware, async function (req, res) {

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
  const musics = Object.values(m.tracks);

  // const url = 'https://shazam.p.rapidapi.com/songs/list-artist-top-tracks?id=40008598&locale=en-US';
  // const options = {
  //   method: 'GET',
  //   headers: {
  //     'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
  //     'X-RapidAPI-Key': '577dc0b40bmsh6ea6fa79b9105aep161387jsn5ee36599a5f6'
  //   }
  // };
  // const message = await fetch(url, options);
  // const m = await message.json();
  // const music = Object.values(m.tracks);
  // console.log(music);
  const db = admin.firestore();
  const user = await admin.auth().verifySessionCookie(req.cookies.session, true);
  const email = user.email;
  var music_user = db.collection('users').doc(email);
  const data_for_user = await music_user.get();
  let music_for_user = []
  if (data_for_user.data()) {music_for_user = data_for_user.data().musics;}

  var filtered = musics.filter(function(value, index, arr){ 
    return music_for_user.includes(value.key);
  });
  // add heart
  for(var i = 0; i < filtered.length; i++){
    filtered[i]["heart"] = true;
  }
  res.render("pages/dashboard", { data : filtered });
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



app.post("/setHeart", async (req, res) => {
  const db = admin.firestore();
  const music = req.body.music;
  const heart = req.body.heart;
  const user = await admin.auth().verifySessionCookie(req.cookies.session, true);
  if(user){
    const email = user.email;
    var music_user = db.collection('users').doc(email);
    music_user.update({email: email});
    var h = parseInt(heart);
    if(h){
      console.log("enter true");
      music_user.update({
        musics: FieldValue.arrayRemove(music)
    });
    }
    else{
      console.log("enter false");
      music_user.update({
        musics: FieldValue.arrayUnion(music)
    });
    }
    
  }
});


app.get("/userprofile", async function(req, res) {
  const db = admin.firestore();
  const user = await admin.auth().verifySessionCookie(req.cookies.session, true);
  if (user){
    const email = user.email;
    const docRef = db.collection("userinfo").doc(email);
    const docSnap = await docRef.get();
    console.log(docSnap.data());
    let bio = "";
    let username = "";
    if (docSnap.data()) {
      bio = docSnap.data().bio;
      username = docSnap.data().username;
    } 
    else {
      await docRef.set({bio: "", username: ""}, {merge: true});
    }
    console.log({email, username, bio});
    res.render("pages/userprofile", {email, username, bio});
  }
  else{
    res.redirect("/sign-in");
  }
}); 



app.post("/updateprofile", async (req, res) => {
  const db = admin.firestore();
  const bio = req.body.Bio;
  const name = req.body.name;
  const user = await admin.auth().verifySessionCookie(req.cookies.session, true);
  if(user){
    const email = user.email;
    const docRef = db.collection("userinfo").doc(email);
    console.log({bio, name});
    await docRef.set({bio: bio, username: name}, {merge: true});
  }
});

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest(app);


app.listen(port);
console.log("Server started at http://localhost:" + port);
