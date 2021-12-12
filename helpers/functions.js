const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

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

function isLoggedIn(req, res, next) {
    if (!req.session.currentUser) {
        req.flash('error', 'Must be logged in')
        return res.redirect('/user/login')
    }
    next()
}





module.exports = {
    catchAsync,
    isLoggedIn,
    checkRegister
}
