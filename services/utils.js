const config = require('config');
const NotFoundError = require('../errors/NotFoundError.js')

// to avoid shitty logging inside my tests
const log = (thingtolog) => {
    if (config.util.getEnv('NODE_ENV') != 'test')
        console.log(thingtolog);
}

// error_handling middleware
const error_handler = (err, req, res, next) => {
    log(err.stack);
    res.status(err.status);
    res.send(err);
};

// 404 errors handling middleware
const notfound_handler = (req, res, next) => {
    return next(new NotFoundError());
};

module.exports = {
    log,
    error_handler,
    notfound_handler
}
