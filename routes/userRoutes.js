const express = require('express')
const router = express.Router()
require('dotenv').config()

const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../helpers/nodemailer')

const expressError = require('../helpers/expressError')

const userModel = require('../models/userModel')

const { catchAsync, checkResetPassword, isLoggedIn, checkRegister } = require('../helpers/functions')




//User routes
router.get('/register', (req, res) => {
    res.locals.title = 'Register'
    res.render('users/register')
})

router.post('/register', checkRegister, catchAsync(async (req, res) => {
    const { userEmail, userUsername, userPassword } = req.body
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(userPassword, 10, function (err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    })

    const user = new userModel({ email: userEmail, username: userUsername, hash: hashedPassword, admin: false, passwordRequest: false })
    await user.save()
    req.session.currentUser = user
    req.flash('success', 'Account succesfully created')
    res.redirect('/')
}))

router.get('/login', (req, res) => {
    res.locals.title = 'Login'
    res.render('users/login')
})

router.post('/login', catchAsync(async (req, res) => {
    const { userUsername, userPassword } = req.body
    const user = await userModel.find({ username: userUsername })
    if (!user.length) {
        req.flash('error', 'Invalid username or password')
        return res.redirect('/user/login')
    }
    const hash = user[0].hash
    //Check if password matches
    const result = await new Promise((resolve, reject) => {
        bcrypt.compare(userPassword, hash, function (err, result) {
            if (err) reject(err)
            resolve(result)
        });
    })
    if (!result) {
        req.flash('error', 'Invalid username or password')
        return res.redirect('/user/login')
    }
    //Store the logged in user in the session
    req.session.currentUser = user[0]
    req.flash('success', 'Welcome back!')
    res.redirect('/')
}))

//Log the user out
router.get('/logout', isLoggedIn, (req, res) => {
    req.session.currentUser = undefined
    req.flash('success', 'See you later!')
    res.redirect('/')
})

router.get('/forgot', (req, res) => {
    res.locals.title = 'Reset your password'
    res.render('users/reset')
})

router.post('/forgot', catchAsync(async (req, res) => {
    const { userEmail } = req.body
    let user = await userModel.find({ email: userEmail })
    console.log(user)
    if (user.length) {
        const uuid = uuidv4()
        user[0].passwordRequest = uuid
        await user[0].save()
        sendEmail(userEmail, uuid)
        return res.send('Email has been sent, please check your spam inbox')
    }
    req.flash('error', 'An account associated with that email address, could not be found')
    return res.redirect('/user/forgot')
}))

router.get('/reset/:uuid', catchAsync(async (req, res) => {
    const { uuid } = req.params
    const user = await userModel.find({ passwordRequest: uuid })
    if (user.length) {
        res.locals.title = 'Reset your password'
        return res.render('users/changePassword', { uuid })
    }
    throw new expressError('The link you are trying to access is depreciated', 404)
}))

router.post('/reset/:uuid', checkResetPassword, catchAsync(async (req, res) => {
    //NEXT STEP TAKE PASSWORD AND RESET IT
    const { uuid } = req.params
    const { userPassword } = req.body
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(userPassword, 10, function (err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    })
    const user = await userModel.find({ passwordRequest: uuid })
    user[0].hash = hashedPassword
    user[0].passwordRequest = false
    await user[0].save()
    req.flash('success', 'Password has been changed succesfully')
    res.redirect('/user/login')
}))

module.exports = router