const config = require('config');
const utils = require('./services/utils')

const messages = {
    prefix: {
        bad_request: "Bad Request error: ",
        validation: "Validation error: ",
        not_fould: "Not found error: ",
        bad_credentials: "Bad Credentials error: "
    },
    missing: {
        email: "Missing email field",
        password: "Missing password field",
        name: "Missing name field"
    },
    not_found: {
        user_with_id: "No found user with id: "
    },
    validation: {
        email: "Not a valid email",
        password: "Password length must be > 8"
    },
    bad_credentials: {
        unauthorized: "Unauthorized"
    }
};

const main_middleware = (err, req, res, next) => {
    utils.log(err.stack);
    res.status(err.status);
    res.send({status: err.status, message: err.message});
};

const throwError = (next, type, msg) => {
    switch (type) {
        case 'bad_request':
            var status = 400;
            msg = messages.prefix.bad_request + msg;
            break;
        case 'validation':
            var status = 400;
            break;
        case 'not_found':
            var status = 404;
            msg = messages.prefix.not_found + msg;
            break;
        case 'bad_credentials':
            var status = 401;
            msg = messages.prefix.bad_credentials + messages.bad_credentials.unauthorized
                || messages.prefix.bad_credentials + msg;
            break;
    }

    var err = new Error(msg);
    err.status = status;
    return next(err);
};

module.exports = {
    main_middleware : main_middleware,
    throwError : throwError,
    messages : messages
};
