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
// TODO AUTH TYPE (admin, mine, auth, false)


apiRouter = express.Router();

apiRouter.post('/auth', async (req, res, next) => {
    const user = await models.User.findOne({where: {email: req.body.email}});
    if (!user)
        return res.status(404).send({ auth: false, message: 'no user found' });
    else {
        const is_password_ok = await usersService.isPasswordOK(req.body.password, user.password);
        if (is_password_ok) {
            const token = usersService.getToken(user);
            res.send({auth: true, message : 'Here is your token', token : token});
        }
        else {
            return res.status(401).send({ auth: false, message: 'Auth failed, bad credentials' });
        }
    }
});

apiRouter.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
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
