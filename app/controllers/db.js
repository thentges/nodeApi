//TODO call a service (which itself calls the models etc (middlewares))
const express = require('express');
const dbm = require('../model/db_manager');

dbRouter = express.Router();

dbRouter.put('/update', (req, res, next) => {
    dbm.updateDB();
    res.send("database cleared and schema updated, reload the server to use it");
});

module.exports = dbRouter;
