class CustomError extends Error {

    constructor(message, status) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.type = this.constructor.name;
        this.message = message || "Error server";
        this.status = status || 500;
    }

}

module.exports = CustomError;
