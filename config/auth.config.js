const passport       = require('passport')
const LocalStrategy  = require('passport-local')
const GitHubStrategy = require('passport-github').Strategy
const { ObjectID }   = require('mongodb')
const bcrypt         = require('bcrypt')

module.exports = (app, Users) => {
  passport.serializeUser((user, done) => {
    done(null, user._id) 
  })
  
  passport.deserializeUser((id, done) => {
    Users.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      if(err) return done(err)
      done(null, doc);
    });
  })

  /** Passport Strategies */
  passport.use(new LocalStrategy((username, password, done) => {
    Users.findOne({ username: username }, (err, user) => {
      if(!user) return done(null, false)
      if(!bcrypt.compareSync(password, user.password)) return done(null, false)
      return done(null, user)
    })
  }))

  passport.use(new GitHubStrategy({
    clientID:     process.env['GITHUB_CLIENT_ID'],
    clientSecret: process.env['GITHUB_CLIENT_SECRET'],
    callbackURL:  "https://boilerplate-advancednode.alloice.repl.co/auth/github/callback"
  }, (accessToken, refreshToken, profile, cb) => {
      Users.findAndModify(
        { id: profile.id },
        {},
        {
          $setOnInsert: {
              id:         profile.id,
              username:   profile.username,
              name:       profile.displayName || 'John Doe',
              photo:      profile.photos[0].value || '',
              email:      Array.isArray(profile.emails)
                            ? profile.emails[0].value
                            : 'No public email',
              created_on: new Date(),
              provider:   profile.provider || ''
          },
          $set: {
            last_login: new Date()
          }, 
          $inc: {
            login_count: 1
          }
        },
        { upsert: true, new: true },
        (err, doc) => {
          if(err) return cb(err)
          return cb(null, doc.value)
        }
      )
  }))
}
