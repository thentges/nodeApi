const CustomError = require('./CustomError');

class NotFoundError extends CustomError {
    constructor(entity, id) {
        let message = 'not found'
        if (entity && id)
            message = `no ${entity} found with id ${id}`;
        else if (entity && !id)
            message = entity;
        super(message, 404);
    }
}

module.exports = NotFoundError;
