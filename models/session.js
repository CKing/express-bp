"use strict"

const Sequelize = require("sequelize")

exports.define = sequelize => {
  const Session = sequelize.define("Session", {
    sid: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    expires: Sequelize.DATE,
    data: Sequelize.STRING(50000)
  })

  Session.extendDefaultFields = (defaults, session) => ({
    data: defaults.data,
    expires: defaults.expires,
  })
}
