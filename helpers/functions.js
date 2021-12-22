const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const reviewModel = require('../models/reviewModel')
const carModel = require('../models/carModel')

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
        req.flash('error', 'Password must contain at least one special character, one number and be at least 6 characters long')
        return res.redirect('/user/register')
    }
    next()
}

function checkResetPassword(req, res, next) {
    const { userPassword } = req.body
    const regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    const { uuid } = req.params
    if (userPassword.length < 6 || !regularExpression.test(userPassword)) {
        req.flash('error', 'New password must contain at least one special character, one number and be at least 6 characters long')
        return res.redirect(`/user/reset/${uuid}`)
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

function isAdmin(req, res, next) {
    if (!req.session.currentUser || !req.session.currentUser.admin) {
        req.flash('error', 'Unauthorized access')
        return res.redirect('/')
    }
    next()
}

async function isReviewOwnerOrAdmin(req, res, next) {
    const { reviewId } = req.params
    const review = await reviewModel.findById(reviewId)
    if (req.session.currentUser._id == review.reviewOwner || req.session.currentUser.admin) {
        return next()

    }
    req.flash('error', 'Unauthorized access')
    return res.redirect(`/car/${req.params.carId}`)
}

async function carNotBooked(req, res, next) {
    const { carId } = req.params
    const car = await carModel.findById(carId)
    if (!car.carBooking.booked) {
        return next()
    }
    req.flash('This car is already booked')
    return res.redirect(`/car/${car._id}`)
}

function validDates(req, res, next) {
    const { bookedFrom, bookedUntil } = req.body
    const bookedFromDate = new Date(bookedFrom); //dd-mm-YYYY
    const bookedUntilDate = new Date(bookedUntil)
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookedFromDate < today) {
        req.flash('error', 'Please select a date which is in the future')
        return res.redirect(`/book/${req.params.carId}`)
    }
    if (bookedUntilDate <= bookedFromDate) {
        req.flash('error', 'Please select a return date which is not prior to the booking date')
        return res.redirect(`/book/${req.params.carId}`)
    }
    return next()
}





module.exports = {
    catchAsync,
    isLoggedIn,
    isReviewOwnerOrAdmin,
    validDates,
    checkResetPassword,
    carNotBooked,
    isAdmin,
    checkRegister
}
