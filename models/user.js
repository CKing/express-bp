"use strict"

const Sequelize = require("sequelize")

exports.define = sequelize => sequelize.define("User", {
  username: Sequelize.STRING,
  password: Sequelize.STRING
})
