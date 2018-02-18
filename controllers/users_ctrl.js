const express = require('express');
const bodyParser = require('body-parser');

const models = require('../models');
const usersService = require('../services/users_service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const utils = require('../services/utils');

userRouter = express.Router();

// creating a user in the db
userRouter.post('/', (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password)
        return res.status(400).send('infos missing');

    usersService.create(req.body.name, req.body.email, req.body.password).then(
        function(user){
            user.password = undefined;
            res.status(201).send(user);
        },
        function(error){
            return res.status(400).send("invalid name, email or password");
        }
    );
});

// get a list of all users
// auth : if unlogged get public fields, if logged get all fields
userRouter.get('/', (req, res, next) => {
    if (req.currentUser){
        var auth = true;
        var select = usersService.allFields;
    }
    else {
        var auth = false;
        var select = usersService.publicFields;
    }
    models.User.findAll({attributes : select}).then(
        (users) => {
            res.send({auth : auth, response : users});
        },
        (error) => {
            utils.log('error');
        }
    );
});

// get a specific user by :id
// auth : if unlogged get public fields, if logged get all fields
userRouter.get('/:id', (req, res, next) => {
    if (req.currentUser){
        var auth = true;
        var select = usersService.allFields;
    }
    else {
        var auth = false;
        var select = usersService.publicFields;
    }

    models.User.findById(req.params.id, {attributes : select}).then(
        (user) => {
            if (user)
                res.send({auth : auth, response : user});
            else
                res.status(404).send({auth : auth, response : "no user with id : " + req.params.id});
        },
        (error) => {
            utils.log('error');
        }
    )
});

// update a specific user by :id
// auth : be logged as the user you want to update
userRouter.put('/:id', (req, res, next) => {
    if (!req.currentUser || req.currentUser.id != req.params.id)
        return res.status(401).send("Bad credentials");

    models.User.findById(req.params.id).then(
        (user) => {
            if (user){

                user.updateAttributes(req.body).then(
                        (user) => {
                            user.password = undefined;
                            res.send(user);
                        },
                        (error) => {
                            res.status(400).send('error updating user');
                        }
                    );
            }
            else
                return res.status(404).send('no user found with id : ' + req.params.id);
        },
        (error) => {
            return res.status(400).send('error server');
        }
    );
});

module.exports = userRouter;
