Express 4.x Boilerplate example
===============================

This project uses **ES 6** features and has been tested on *node v6*, but should work on *node v5* and *node v4* as well.

Everything is commented, please look through the code to see how it works.

Database Migrations
-------------------
Sequelize supports database migrations, read the [docs](http://docs.sequelizejs.com/en/v3/docs/migrations/) on migrations for details.

This project is not using migrations, instead it is calling `sequelize.sync({force: true})` on launch, which will destructivly update the schema. Remove force option to turn off `DROP TABLE IF EXISTS` calls, or better use migrations.
