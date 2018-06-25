const express = require('express');

const usersService = require('../services/users_service');

const MissingFieldError = require('../errors/MissingFieldError');
const ValidationError = require('../errors/ValidationError');
const AccessDeniedError = require('../errors/AccessDeniedError');
const NotFoundError = require('../errors/NotFoundError');
const BadCredentialsError = require('../errors/BadCredentialsError');

userRouter = express.Router();

// creating a user in the db
userRouter.post('/', async (req, res, next) => {
    if (!req.body.email)
        return next(new MissingFieldError("email"));
    if (!req.body.password)
        return next(new MissingFieldError("password"));
    if (!req.body.name)
        return next(new MissingFieldError("name"));

    try {
        const user = await usersService.create(req.body.name, req.body.email, req.body.password);
        user.password = undefined; // we do not want to send the password
        res.status(201).send(user);
    } catch (error) {
        return next(new ValidationError(error.errors[0].message));
    }
});

// get a list of all users
// auth : if unlogged get public fields, if logged get all public fields
userRouter.get('/', async (req, res, next) => {
    let fields;
    if (req.currentUser)
        fields = usersService.publicFields;
    else
        fields = usersService.restrictedFields;

    const users = await usersService.getAll(fields)
    res.send(users);
});

// get a specific user by :id
// auth : if unlogged get public fields, if logged get all fields
userRouter.get('/:id', async (req, res, next) => {
    let fields;
    if (req.currentUser && req.currentUser.id == req.params.id)
        fields = usersService.privateFields;
    else if (req.currentUser)
        fields = usersService.publicFields;
    else
        fields = usersService.restrictedFields;

    const user = await usersService.get(req.params.id, fields);
    if (user)
        res.send(user);
    else
        return next(new NotFoundError("user", req.params.id));
});

// update a specific user by :id
// auth : be logged as the user you want to update
userRouter.put('/:id', async (req, res, next) => {
    if (!req.currentUser)
        return next(new BadCredentialsError());
    else if (req.currentUser.id != req.params.id)
        return next(new AccessDeniedError());

    try {
        const user = await usersService.update(req.params.id, req.body);
        res.send(usersService.formatPutResponse(user));
    } catch (e) {
        return next(new NotFoundError("user", req.params.id));
    }

});

module.exports = userRouter;
