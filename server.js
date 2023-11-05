'use strict';
const express = require('express');

const fccTesting        = require('./freeCodeCamp/fcctesting.js');
const routesControllers = require('./controllers/routes.js')
const socketControllers = require('./controllers/socket.js')

/** Configs */
const myDB = require('./config/connection.config.js');
const auth = require('./config/auth.config.js')

/** Auth */
const passport         = require('passport')
const passportSocketIo = require('passport.socketio')
const session          = require('express-session')
const MongoStore       = require('connect-mongo')(session);
const store            = new MongoStore({ url: process.env['MONGO_URI'] });

const app = express();

/** Socket */
const http = require('http').createServer(app)
const io   = require('./config/socket.config.js')(http)

fccTesting(app); //For FCC testing purposes

/** Middlewares */
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env['SESSION_SECRET'],
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  store: store,
  key: 'express.sid'
}))

/** Passport */
app.use(passport.initialize())
app.use(passport.session())

/** Set template engine */
app.set('view engine', 'pug')
app.set('views', "./views/pug")

try {
  myDB(async client => {
    const Users = await client.db('database').collection('users');

    routesControllers(app, Users)
    auth(app, Users)
    socketControllers(app, io)
    
  })
} catch (e) {
  app.route('/').get((req, res) => {
    res.render('index', {
      title: e,
      message: 'Unable to connect to database'
    });
  });
}

app.use((err, req, res, next) => {
  res.status(400)
    .type('text')
    .send('Page not Found')
})

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
