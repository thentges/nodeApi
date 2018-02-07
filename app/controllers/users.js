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
    var user = em.get('User', null, {"rowid" : "="+req.params.id});
    if (!user)
        res.status(404).send('no resource found')
    res.send(user);
});

//magic get
userRouter.get('/:by/:value', (req, res, next) => {
    var user = em.get('User', null, {name : '="'+req.params.value+'"'});
    if (!user)
        res.status(404).send()
    res.send(user);
});

//app.get('/user/:id/:property')

module.exports = userRouter;
