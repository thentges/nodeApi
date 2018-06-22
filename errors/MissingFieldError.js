const CustomError = require('./CustomError');

class MissingFieldError extends CustomError {
    constructor(field) {
        super(`Missing ${field} field`, 400);
    }
}

module.exports = MissingFieldError;
