class ExpressError extends Error {
    //Custom express error
    constructor(message, status) {
        super()
        this.message = message;
        this.status = status;
    }
}

module.exports = ExpressError;