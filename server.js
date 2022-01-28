'use strict';
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const auth = require('./auth')
const routes = require('./routes')

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// app.use((req, res, next) => {
//   res.status(404)
//   .type("text")
//   .send("Not Found");
// })

app.set('view engine', 'pug');

myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");

  auth(app, myDataBase)
  routes(app, myDataBase)

}).catch(e => {
  app.route("/").get((req, res) => {
    res.render(__dirname + "/views/pug/index.pug", {
      title: e,
      message: "Unable to Login"
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
