const express = require('express');
const bodyParser = require('body-parser');

const models = require('../models');
const jwt = require('jsonwebtoken');
const utils = require('../services/utils');

// USE req.currentUser to know if a valid token has been provided
// if !req.currentUser, the user is not authentified through the API
// for non public routes, if req.currentUser isn't defined, then it shouldn't send any response

apiRouter = express.Router();

apiRouter.post('/auth', (req, res, next) => {
    models.User.findOne({ where: {email : req.body.email} }).then(
        function(user){
            if (!user)
                throw res.status(404).send({ success: false, message: 'Auth failed, no user found' });
            else {
                utils.isPasswordOK(req.body.password, user.password).then(
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

apiRouter.use((req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, CONFIG.jwt_encryption, function(err, decoded) {
      if (err) {
          console.log(err);
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
