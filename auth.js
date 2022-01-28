require('dotenv').config()
const passport = require('passport')
const LocalStrategy = require('passport-local')
const ObjectID = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
const GitHubStrategy = require('passport-github').Strategy

/*
This thing shows how to authenticate the client using github
In case that you need this, make sure that you need a client ID, and client Secret stored
in your env file. 

You would get these two in Oauth of github  I think, I'm not sure but search it if you really
need it
 */
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      console.log(profile);
      database.findOneAndUpdate(
          {id: profile.id},
          {
              $setOnInsert: {
                  id:profile.id,
                  name: profile.name,
                  photo: profile.photos[0].value || "",
                  email: Array.isArray(profile.emails)
                         ? profile.emails[0].value
                         : "No public email",
                  createdOn: new Date(),
                  provider: profile.provider || ""
              }, 
              $set: {
                  last_login: new Date()
              },
              $inc: {
                  login_count: 1
              }
          }, 
          {upsert: true, new: true},
          (err, doc) => {
              return cb(null, doc.value)
          }
      )
    });
  }
));

module.exports = (app, database) => {
    passport.serializeUser((user, done) => { 
        done(null, user._id);
      })
    
      passport.deserializeUser((id, done) => {
        myDataBase.findOne({_id: new ObjectID(ID)}, (err, doc) => {
          done(null, doc)
        });
      });
    
      passport.use(new LocalStrategy((user, password, done) => {
        myDataBase.findOne({username: user}, (err, username) => {
          console.log("User" + username + "attempted to die")
          if(err){
            done(null, err)
          }
          if(!username){
            done(null, false)
          }
          if(bcrypt.compareSync(password, username.password)){
            done(null, false)
          }
          return(null, username)
        })
      }))
}