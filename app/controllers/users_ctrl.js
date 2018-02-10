const express = require('express');
const bodyParser = require('body-parser');

const models = require('../models');
const usersService = require('../services/users_service');

//TODO make middlewares
userRouter = express.Router();

userRouter.post('/', (req, res, next) => {
    if (!req.body.name || !req.body.email)
        throw res.status(400).send('infos missing');

    usersService.create(req.body.name, req.body.email).then(
        function(user){
            res.status(201).send(user);
        },
        function(error){
            throw res.status(400).send("invalid name or email");
        }
    );
});

userRouter.get('/:id', (req, res, next) => {
    models.User.findById(req.params.id).then(
        function(user){
            if (user)
                res.send(user);
            else
                throw res.status(404).send('no user found with id : ' + req.params.id);

        },
        function(error){
            throw res.status(400).send('error server');
        }
    );
});


// get a user by given :prop with the given :value
userRouter.get('/:prop/:value', (req, res, next) => {
    var array = {};
    array[req.params.prop] = req.params.value;

    models.User.findOne({ where: array }).then(
        function(user){
            if (user)
                res.send(user);
            else
                throw res.status(404).send('no user found with '+ req.params.prop +' : ' + req.params.value);

        },
        function(error){
            throw res.status(400).send('error server');
        }
    );
});

// get the :only property of the user found with the given :value for a given prop
userRouter.get('/:prop/:value/:only', (req, res, next) => {
    var array = {};
    array[req.params.prop] = req.params.value;

    models.User.findOne({ where: array }).then(
        function(user){
            if (user && user[req.params.only])
                res.send(user[req.params.only]);
            else
                throw res.status(404).send('no user found with '+ req.params.prop +' : ' + req.params.value);

        },
        function(error){
            throw res.status(400).send('error server');
        }
    );
});

module.exports = userRouter;
