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




// memory
var local_musics = require("./app/user-music");


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
  const db = admin.firestore();
  const sessionCookie = req.cookies.session || "";
  var musics_for_user = {};
  if(sessionCookie == ""){
    // no user: get musics
    muscis_for_user = await local_musics.get();
  }
  else{
    // Firestore: get user & user's music list
    const user = await admin.auth().verifySessionCookie(sessionCookie, true);
    const email = user.email;
    const music_user = db.collection('users').doc(email);
    const data_for_user = await music_user.get();
    const user_list = data_for_user.data().musics;
    // Change local list
    musics_for_user = await local_musics.userlist(user_list);
  }
  res.render("pages/index", { data: musics_for_user });
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-up");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
  // get firestore
  const db = admin.firestore();
  const user = await admin.auth().verifySessionCookie(req.cookies.session, true);
  const email = user.email;
  var music_user = db.collection('users').doc(email);
  const data_for_user = await music_user.get();
  const user_list = data_for_user.data().musics;
  var musics_for_user = await local_musics.get_user(user_list);
  res.render("pages/dashboard", { data : musics_for_user});
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


// Pure backend

app.post("/setHeart", async (req, res) => {
  // edit firestore
  const db = admin.firestore();
  const music = req.body.music;
  const heart = req.body.heart;
  const sessionCookie = req.cookies.session || "";
  if(sessionCookie == ""){
    res.redirect("/sign-in");
  }
  else{
    // find current user's database
    const user = await admin.auth().verifySessionCookie(req.cookies.session, true);
    const email = user.email;
    var music_user = db.collection('users').doc(email);
    // firestore update
    // music_user.update({email: email});
    if(parseInt(heart)) 
      await music_user.set({ musics: FieldValue.arrayRemove(music) }, { merge: true });
    else 
      await music_user.set({ musics: FieldValue.arrayUnion(music) }, { merge: true });
  }
  res.status(200).send(JSON.stringify({ status: "Successfully set heart" }));
});

app.get("/album", async(req, res) => {
  const key = req.query.key;
  const album = await local_musics.get_album(key);
  res.render("pages/album", {album: album});
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
