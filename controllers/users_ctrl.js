const express = require('express');
const bodyParser = require('body-parser');

const models = require('../models');
const usersService = require('../services/users_service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const MissingFieldError = require('../errors/MissingFieldError');
const ValidationError = require('../errors/ValidationError');
const AccessDeniedError = require('../errors/AccessDeniedError');
const NotFoundError = require('../errors/NotFoundError');
const BadCredentialsError = require('../errors/BadCredentialsError');

userRouter = express.Router();

// creating a user in the db
userRouter.post('/', (req, res, next) => {
    if (!req.body.email)
        return next(new MissingFieldError("email"));
    if (!req.body.password)
        return next(new MissingFieldError("password"));
    if (!req.body.name)
        return next(new MissingFieldError("name"));

    usersService.create(req.body.name, req.body.email, req.body.password).then(
        function(user){
            user.password = undefined;
            res.status(201).send(user);
        },
        function(error){
            return next(new ValidationError(error.errors[0].message));
        }
    );
});

// get a list of all users
// auth : if unlogged get public fields, if logged get all fields
userRouter.get('/', (req, res, next) => {
    let auth;
    let select;
    if (req.currentUser){
        auth = true;
        select = usersService.publicFields;
    }
    else {
        auth = false;
        select = usersService.restrictedFields;
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
    let auth;
    let select;
    if (req.currentUser && req.currentUser.id == req.params.id){
        auth = true;
        select = usersService.privateFields;
    }
    else if (req.currentUser) {
        auth = true;
        select = usersService.publicFields;
    }
    else {
        auth = false;
        select = usersService.restrictedFields;
    }

    models.User.findById(req.params.id, {attributes : select}).then(
        (user) => {
            if (user)
                res.send({auth : auth, response : user});
            else
                return next(new NotFoundError("user", req.params.id));
        },
        (error) => {
            return next(error);
        }
    )
});

// update a specific user by :id
// auth : be logged as the user you want to update
userRouter.put('/:id', (req, res, next) => {
    if (!req.currentUser)
        return next(new BadCredentialsError());
    else if (req.currentUser.id != req.params.id)
        return next(new AccessDeniedError());

    models.User.findById(req.params.id).then(
        (user) => {
            if (user){
                user.set(req.body);
                user.save();
                const resp = user.get();
                resp.password = undefined;
                const fields = user.changed() ? Object.getOwnPropertyNames(user._changed) : undefined;
                res.send({user: resp, updated: {status: user.changed() ? true : false, fields: fields}});
            }
            else
                return next(new NotFoundError("user", req.params.id));
        },
        (error) => {
            return next(error);
        }
    );
});

module.exports = userRouter;
