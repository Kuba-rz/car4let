function catchAsync(fn) {
    //An error handler for async functions
    return function (req, res, next) {
        fn(req, res, next).catch(err => next(err))
    }
}


module.exports = {
    catchAsync
}