const express = require('express');
const bodyParser = require('body-parser');

const models = require('../models');
const usersService = require('../services/users_service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

userRouter = express.Router();

userRouter.post('/', (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password)
        throw res.status(400).send('infos missing');

    usersService.create(req.body.name, req.body.email, req.body.password).then(
        function(user){
            user.password = undefined;
            res.status(201).send(user);
        },
        function(error){
            throw res.status(400).send("invalid name, email or password");
        }
    );
});

// TODO REFACTOR ALL THESE ROUTES WITH SHITTY URLS

// MDLWRE
userRouter.use('/byid/:id', (req, res, next) => {
    models.User.findById(req.params.id).then(
        function(user){
            if (user) {
                res.locals.user = user;
                next();
            }
            else
                throw res.status(404).send('no user found with id : ' + req.params.id);

        },
        function(error){
            throw res.status(400).send('error server');
        }
    );
});

userRouter.get('/byid/:id', (req, res,next) => {
    if (!req.currentUser){
        res.status(401).send('no auth to use this route');
    }
    else {
        res.locals.user.password = undefined;
        res.send(res.locals.user);
    }
});

userRouter.put('/byid/:id/:prop/:value', (req, res,next) => {
    array = {};
    array[req.params.prop] = req.params.value;
    res.locals.user.updateAttributes(array).then(
        function(success){
            res.send(success);
        },
        function(error){
            res.status(400).send('error updating user');
        }
    );

});

// MDLWARE
userRouter.use('/:prop/:value', (req, res, next) => {
    var array = {};
    array[req.params.prop] = req.params.value;

    models.User.findOne({ where: array }).then(
        function(user){
            if (user) {
                res.locals.user = user;
                next();
            }
            else
                throw res.status(404).send('no user found with '+ req.params.prop +' : ' + req.params.value);

        },
        function(error){
            throw res.status(400).send('error server');
        }
    );
});

// get a user by given :prop with the given :value
userRouter.get('/:prop/:value', (req, res, next) => {
    res.send(res.locals.user);
});

// get the :only property of the user found with the given :value for a given prop
userRouter.get('/:prop/:value/:only', (req, res, next) => {
    res.send(res.locals.user[req.params.only]);
});


module.exports = userRouter;
