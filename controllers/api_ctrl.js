const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');

const models = require('../models');
const jwt = require('jsonwebtoken');
const usersService = require('../services/users_service');

const utils = require('../services/utils');

// USE req.currentUser to know if a valid token has been provided
// if !req.currentUser, the user is not authentified through the API
// for non public routes, if req.currentUser isn't defined, then it shouldn't send any response

apiRouter = express.Router();

apiRouter.post('/auth', (req, res, next) => {
    models.User.findOne({ where: {email : req.body.email} }).then(
        function(user){
            if (!user)
                return res.status(404).send({ auth: false, message: 'no user found' });
            else {
                usersService.isPasswordOK(req.body.password, user.password).then(
                    () => {
                        var token = usersService.getToken(user);
                        res.send({auth: true, message : 'Here is your token', token : token});
                    },
                    () => {
                        return res.status(400).send({ auth: false, message: 'Auth failed, bad credentials' });
                    }
                );
            }
        },
        function(error){
            return res.status(400).send('error server');
        }
    );
});

apiRouter.use((req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, config.jwt_encryption, function(err, decoded) {
      if (err) {
          utils.log(err);
        next();
      }
      else {
        req.currentUser = decoded;
        next();
      }
    });
  }
  else
    next();
});

module.exports = apiRouter;
