"use strict"

module.exports = app => {
  app.get("/", (req, res) => {
    return res.render("index.html", { username: req.session.username })
  })

  app.get("/register", (req, res) => res.render("register.html"))
  app.post("/register", (req, res) => {
    const { username, password } = req.body

    // redirect to get request. could render template with error messages as well if desired
    if (!username || !password) return res.redirect("/register")

    const User = app.locals.models.getModel("User")
    User.create({ username, password })
    // redirect to home page. should notify user with success message
    .then(user => {
      req.session.username = user.username
      return res.redirect("/")
    })
    // redirect to get request. could render template with error messages as well if desired
    .catch(err => res.redirect("/redirect"))
  })
}
