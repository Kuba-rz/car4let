const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')

const userModel = require('../models/userModel')

const { catchAsync, isLoggedIn, checkRegister } = require('../helpers/functions')




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

    const user = new userModel({ email: userEmail, username: userUsername, hash: hashedPassword, admin: false })
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

module.exports = router