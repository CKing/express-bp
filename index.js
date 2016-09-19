"use strict"

// prefer let/const over var, better block scope
// prefer const over let, if you dont change the reference to an object
const path = require("path")
const fs = require("fs")
const config = require("./config")

// catch global exceptions
process.on("uncaughtException", err => console.error(err))
process.on("unhandledRejection", err => console.error(err))


// set environment variable `NODE_ENV` to "production" to disable
// development options
const DEBUG_MODE = process.env.NODE_ENV !== "production"

// initialize sequelize
const Sequelize = require("sequelize")
const sequelize = new Sequelize(config.database.name, config.database.user, config.database.pass, {
  host: config.database.host,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: DEBUG_MODE? console.log: () => {}
})

// define all models
const modelPath = path.join(__dirname, "models")
const modelFiles = fs.readdirSync(modelPath).map(fileName => require(path.join(modelPath, fileName)))
// first iteration: define all the models
const models = modelFiles.map(model => model.__definition = model.define(sequelize))
// second iteration: define all the relations
modelFiles.forEach(model => model.relation && model.relation(model.__definition, models))
// sync changes to schema
sequelize.sync({ force: DEBUG_MODE })

// initialize express
const express = require("express")
const app = express()
app.locals.models = sequelize.modelManager // get models into the request

// install request logger (dev on debug mode, short in production)
// available default formats:
//   combined, common, dev, short, tiny
app.use(require("morgan")(DEBUG_MODE? "dev": "short"))

// static file provider
app.use(express.static(path.join(__dirname, "public")))

// override the request method (issue a post request and set
//  `X-HTTP-Method-Override` to the request method you meant, like PUT or DELETE)
app.use(require("method-override")())

// parse request bodys in post and put requests
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// create the session adapter
const session = require("express-session")
const SequelizeSession = require("connect-session-sequelize")(session.Store)
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: config.session.secret,
  store: new SequelizeSession({
    db: sequelize,
    table: "Session",
    extendDefaultFields: sequelize.modelManager.getModel("Session").extendDefaultFields
  })
}))

// attach templating to app
const nunjucks = require("express-nunjucks")
app.set("views", path.join(__dirname, "views"))
nunjucks(app, { watch: DEBUG_MODE, noCache: DEBUG_MODE })

// initialize application logic
require("./app")(app)
const [host, port] = [config.http.host || "localhost", config.http.port || 12345]
app.listen(port, host)
console.log(`listening on port ${host}:${port}`)
