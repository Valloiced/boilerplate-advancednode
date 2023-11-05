const passport = require('passport')
const bcrypt   = require('bcrypt')

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next()
  return res.redirect('/')
}

module.exports = (app, Users) => {
  app
    .route('/')
    .get((req, res) => {
      res.render('index.pug', {
        title: "Connected to Database",
        message: "Please login",
        showLogin: true,
        showRegistration: true,
        showSocialAuth: true
      })
  });

  app
    .route('/login')
    .post(passport.authenticate('local', { failureRedirect: '/' }),
      (req, res) => {
        res.redirect('/profile')
  })

  app
    .route('/profile')
    .get(ensureAuthenticated, (req, res) => {
      res.render('profile.pug', {
        username: req.user.username
      })
  })
  
  app
    .route('/register')
    .post(async (req, res, next) => {
    try {
      let user = await Users.findOne({ username: req.body.username })
      if (user) return res.redirect('/')

      const hashPassword = bcrypt.hashSync(req.body.password, 12)
      const newUser = await Users.insertOne({
        username: req.body.username,
        password: hashPassword
      })

      next(null, newUser.ops[0])

    } catch (e) {
      console.log(e)
      next(e)
    }
  }, passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile')
    }
  )

  app
    .route('/chat')
    .get(ensureAuthenticated,
        (req, res) => {
          res.render('chat.pug', {
            user: req.user
          })
        })  

  app
    .route('/auth/github')
    .get(passport.authenticate('github', { failureRedirect: "/" }))

  app
    .route('/auth/github/callback')
    .get(passport.authenticate('github', { failureRedirect: "/" }), 
      (req, res) => {
        req.session.user_id = req.user.id
        res.redirect('/chat')
  })
  
  app
    .route('/logout')
    .get((req, res) => {
      req.logout()
      res.redirect('/')
  })
}