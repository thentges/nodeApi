const express = require('express');

const authService = require('../services/auth_service');
const usersService = require('../services/users_service')

const NotFoundError = require('../errors/NotFoundError');
const BadCredentialsError = require('../errors/BadCredentialsError');

// USE req.currentUser to know if a valid token has been provided
// if !req.currentUser, the user is not authentified through the API
// for non public routes, if req.currentUser isn't defined, then it shouldn't send any response
// TODO AUTH TYPE (admin, mine, auth, false)


apiRouter = express.Router();

apiRouter.post('/auth', async (req, res, next) => {
    const user = await usersService.getByEmail(req.body.email);
    if (!user)
        return next(new NotFoundError("email not found"));
    else {
        const is_password_ok = await authService.isPasswordOK(req.body.password, user.password);
        if (is_password_ok) {
            const token = authService.getToken(user);
            res.send({token, message: "authenticated"});
        }
        else
            return next(new BadCredentialsError("invalid password"))
    }
});

// if there is a token, we assign the decoded value to req.currentUser
// if the token is invalid, we treat it like there was no token (no auth)
apiRouter.use(async (req, res, next) => {
    const token = req.headers['authorization'] ?
        req.headers['authorization'].replace("Bearer ", "") :
        req.headers['x-access-token']
        
    if (token) {
        req.currentUser = await authService.decode(token);
        next();
    }
    else
        next();
});

module.exports = apiRouter;
