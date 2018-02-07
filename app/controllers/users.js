//TODO call a service (which itself calls the models etc (middlewares))
const express = require('express');
const bodyParser = require('body-parser');
const em = require('../model/entity_manager');
const dbm = require('../model/db_manager');

userRouter = express.Router();

userRouter.post('/', (req, res, next) => {
    if (!req.body.name || !req.body.mail) {
        res.status(400).send('infos missing');
        return;
    }
    var user = em.addUser(req.body.name, req.body.mail);
    res.status(201).send(user);
});

userRouter.get('/:id', (req, res, next) => {
    var test = em.get('test', null, {"rowid" : "="+req.params.id});
    if (!test)
        res.status(404).send('no resource found')
    res.send(test);
});

//app.get('/user/:id/:property')

module.exports = userRouter;
