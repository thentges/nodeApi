const CustomError = require('./CustomError');

class AccessDeniedError extends CustomError {
    constructor(message) {
        super(message || "Access Denied", 403);
    }
}

module.exports = AccessDeniedError;
