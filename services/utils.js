const config = require('config');

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

module.exports = {
    log,
    error_handler
}
