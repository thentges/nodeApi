const express = require('express');
const bodyParser = require('body-parser');

const models = require('../models');
const usersService = require('../services/users_service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

userRouter = express.Router();

userRouter.post('/auth', (req, res, next) => {
    // retrieve the given user
    models.User.findOne({ where: {email : req.body.email} }).then(
        function(user){
            if (!user)
                throw res.status(404).send({ success: false, message: 'Auth failed, no user found' });
            else {
                usersService.isPasswordOK(req.body.password, user.password).then(
                    () => {
                        const payload = {
                                name : user.name,
                                email : user.email
                            };
                            console.log(CONFIG.jwt_encryption);
                            var token = jwt.sign(payload, CONFIG.jwt_encryption, {
                                expiresIn: "1 day"
                            });
                            res.send({success: true, message : 'Here is your token', token : token});
                    },
                    () => {
                        throw res.status(400).send({ success: false, message: 'Auth failed, bad credentials' });
                    }
                );
            }
        },
        function(error){
            throw res.status(400).send('error server');
        }
    );
});

userRouter.post('/', (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password)
        throw res.status(400).send('infos missing');

    usersService.create(req.body.name, req.body.email, req.body.password).then(
        function(user){
            // user.password = undefined; // to make sure the password isn't sent anywhere
            res.status(201).send(user);
        },
        function(error){
            throw res.status(400).send("invalid name, email or password");
        }
    );
});

userRouter.use((req, res, next) => {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, CONFIG.jwt_encryption, function(err, decoded) {
      if (err) {
          console.log(err);
        throw res.send({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.currentUser = decoded;
        next();
      }
    });
  }
  else
    throw res.send({ success: false, message: 'No token found'});
});

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
    if (req.decoded)
        res.send(res.locals.user);
    else
        res.send('no rights');
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
