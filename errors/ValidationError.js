const CustomError = require('./CustomError');

class ValidationError extends CustomError {
    constructor(message) {
        super(message, 400);
    }
}

module.exports = ValidationError;
