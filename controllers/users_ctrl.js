const express = require('express');
const bodyParser = require('body-parser');

const models = require('../models');
const usersService = require('../services/users_service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const throwError = require('../error_handler').throwError;
const error_messages = require('../error_handler').messages;

userRouter = express.Router();

// creating a user in the db
userRouter.post('/', (req, res, next) => {
    if (!req.body.email)
        return throwError(next, "bad_request", error_messages.missing.email);
    if (!req.body.password)
        return throwError(next, "bad_request", error_messages.missing.password);
    if (!req.body.name)
        return throwError(next, "bad_request", error_messages.missing.email);

    usersService.create(req.body.name, req.body.email, req.body.password).then(
        function(user){
            user.password = undefined;
            res.status(201).send(user);
        },
        function(error){
            return throwError(next, "validation", error.message);
        }
    );
});

// get a list of all users
// auth : if unlogged get public fields, if logged get all fields
userRouter.get('/', (req, res, next) => {
    if (req.currentUser){
        var auth = true;
        var select = usersService.publicFields;
    }
    else {
        var auth = false;
        var select = usersService.restrictedFields;
    }
    models.User.findAll({attributes : select}).then(
        (users) => {
            res.send({auth : auth, response : users});
        },
        (error) => {
            return next(error);
        }
    );
});

// get a specific user by :id
// auth : if unlogged get public fields, if logged get all fields
userRouter.get('/:id', (req, res, next) => {
    if (req.currentUser && req.currentUser.id == req.params.id){
        var auth = true;
        var select = usersService.privateFields;
    }
    else if (req.currentUser) {
        var auth = true;
        var select = usersService.publicFields;
    }
    else {
        var auth = false;
        var select = usersService.restrictedFields;
    }

    models.User.findById(req.params.id, {attributes : select}).then(
        (user) => {
            if (user)
                res.send({auth : auth, response : user});
            else
                return throwError(next, "not_found", error_messages.not_found.user_with_id + req.params.id);
        },
        (error) => {
            return next(error);
        }
    )
});

// update a specific user by :id
// auth : be logged as the user you want to update
userRouter.put('/:id', (req, res, next) => {
    if (!req.currentUser || req.currentUser.id != req.params.id)
        return throwError(next, "bad_credentials");

    models.User.findById(req.params.id).then(
        (user) => {
            if (user){
                user.set(req.body);
                user.save();
                var resp = user.get();
                resp.password = undefined;
                var fields = user.changed() ? Object.getOwnPropertyNames(user._changed) : undefined;
                res.send({user: resp, updated: {status: user.changed() ? true : false, fields: fields}});
            }
            else
                return throwError(next, 'not_found', error_messages.not_found.user_with_id + req.params.id);
        },
        (error) => {
            return next(error);
        }
    );
});

module.exports = userRouter;
