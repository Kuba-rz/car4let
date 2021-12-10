function catchAsync(fn) {
    //An error handler for async functions
    return function (req, res, next) {
        fn(req, res, next).catch(err => next(err))
    }
}



function checkRegister(req, res, next) {
    const { userUsername, userPassword } = req.body
    const regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (userUsername.length < 6 || userUsername.length > 16) {
        req.flash('error', 'Username must be between 6 and 16 characters long')
        return res.redirect('/user/register')
    }
    if (!regularExpression.test(userPassword)) {
        req.flash('error', 'Passwrd must contain at least one special character, one number and be at least 6 characters long')
        return res.redirect('/user/register')
    }
    next()
}




module.exports = {
    catchAsync,
    checkRegister
}
