/** Socket */
const passportSocketIo = require('passport.socketio')
const cookieParser     = require('cookie-parser')
const session          = require('express-session')
const MongoStore       = require('connect-mongo')(session);
const store            = new MongoStore({ url: process.env['MONGO_URI'] });

module.exports = (http) => {
  const io = require('socket.io')(http)

  const onAuthorizeSuccess = (data, accept) => {
    console.log('successful connection to socket.io');

    accept(null, true);
  }

  const onAuthorizeFail = (data, message, error, accept) => {
    if (error) throw new Error(message);
    console.log('failed connection to socket.io:', message);
    accept(null, false);
  }

  io.use(
    passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: 'express.sid',
      secret: process.env['SESSION_SECRET'],
      store: store,
      success: onAuthorizeSuccess,
      fail: onAuthorizeFail
    })
  )

  return io
}

