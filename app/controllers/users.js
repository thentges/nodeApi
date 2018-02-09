//TODO call a service (which itself calls the models etc (middlewares))
const express = require('express');
const bodyParser = require('body-parser');
const em = require('../model/entity_manager');
const dbm = require('../model/db_manager');

userRouter = express.Router();

userRouter.post('/', (req, res, next) => {

    if (!req.body.name || !req.body.mail)
        throw res.status(400).send('infos missing');

    if (em.get('User', null, {'mail': "="+'="'+req.body.mail+'"'}))
        throw res.status(400).send('mail already taken');

    var user = em.addUser(req.body.name, req.body.mail);
    res.status(201).send(user);
});

userRouter.get('/:id', (req, res, next) => {
    var user = em.get('User', null, {"rowid" : "="+req.params.id});

    if (!user)
        throw res.status(404).send('no resource found');

    res.send(user);
});

// get a user by given :prop with the given :value
userRouter.get('/:prop/:value', (req, res, next) => {
    var array = {};
    array[req.params.prop] = '="'+req.params.value+'"';
    var user = em.get('User', null, array);

    if (!user)
        throw res.status(404).send('resource not found');

    res.send(user);
});

// get the :only property of the user found with the given :value for a given prop
userRouter.get('/:prop/:value/:only', (req, res, next) => {
    var array = {};
    array[req.params.prop] = '="'+req.params.value+'"';
    var user = em.get('User', req.params.only, array);

    if (!user)
        throw res.status(404).send('resource not found');

    res.send(user);
});

module.exports = userRouter;
