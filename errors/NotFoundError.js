const CustomError = require('./CustomError');

class NotFoundError extends CustomError {
    constructor(entity, id) {
        super(`no ${entity} found with id ${id}`, 404);
    }
}

module.exports = NotFoundError;
