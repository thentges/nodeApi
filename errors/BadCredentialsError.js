const CustomError = require('./CustomError');

class BadCredentialsError extends CustomError {
    constructor(message) {
        super(message || "Bad Credentials", 401);
    }
}

module.exports = BadCredentialsError;
