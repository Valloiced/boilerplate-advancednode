const passport = require('passport')
const bcrypt = require('bcrypt')

module.exports = (app, database) => {
    let ensureAuthenticated = (req, res, next) => {
        if(req.isAuthenticated()){
          return next()
        }
        res.redirect("/")
      }
    
      app.route("/register").post((req, res, next) => {
        let hash = bcrypt.hashSync(req.body.password, 12)
        myDataBase.findOne({username: req.body.username}, (err, data) => {
          if(err){
            next(err)
          } else if(data){
            res.redirect("/")
          } else {
            myDataBase.insertOne({
              username: req.body.username,
              password: hash
            }, (err, doc) => {
              if(err){
                done(null, err)
              }
              next(null, doc.ops[0])
            })
          }
        }, passport.authenticate('local', {failureRedirect: "/"}, (req, res) => {
          res.redirect("/profile")
        }) 
      )
    })
    
      app.route("/").get((req, res) => {
        res.render(__dirname + "/views/pug/index.pug", {
          title: "Connected to Database",
          message: "Please Login",
          showLogin: true,
          showRegistration: true,
          showSocialAuth: true
        });
      });
    
      app.route("/login").post(passport.authenticate('local', {failureRedirect: "/"}),
               (req, res) => {
                  res.redirect("/profile")
                })

      app.route("/auth/github").get(passport.authenticate('github'))
      app.route("/auth/github/callback").get(passport.authenticate('github', {failureRedirect: '/'}),
                (req, res) => {
                    res.redirect("/profile")
                })

      app.route("/profile").get(ensureAuthenticated, (req, res) => {
        res.render(process.cwd() + "/views/pug/profile", {username: req.user.username})
      })
    
      app.route("/logout").get((req, res) => {
        req.logout()
        res.redirect("/");
      })
    
}