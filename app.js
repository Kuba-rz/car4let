require('dotenv').config()
const express = require('express')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const dateTime = require('date-and-time')

const { cloudinary, storage } = require('./cloudinary/index')
const multer = require('multer')
const upload = multer({ storage: storage })

const carModel = require('./models/carModel')
const userModel = require('./models/userModel')
const reviewModel = require('./models/reviewModel')
const bookingModel = require('./models/bookingModel')

const expressError = require('./helpers/expressError')

const carValidate = require('./helpers/carValidate')
const { catchAsync, isLoggedIn, isReviewOwnerOrAdmin, validDates, carNotBooked, isAdmin, checkRegister } = require('./helpers/functions')


const carRoutes = require('./routes/carRoutes')
const bookRoutes = require('./routes/bookRoutes')








//Database URL depending if we are in production
const DBUrl = process.env.mongoAtlasURL || 'mongodb://localhost:27017/car4let'
const secret = process.env.SECRET || 'car4letsecret'

//Connect the app to mongoose
async function connectMongo() {
    try {
        await mongoose.connect(DBUrl);
        console.log('All good and connected')
    }
    catch (err) {
        console.log(`Error: ${err}`)
    }
}

connectMongo()




const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.engine('ejs', ejsMate)

//Setting everything for use
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/img', express.static(__dirname + '/images'));



//Session options
const sess = {
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        //Make the cookie expire after a week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sess))
app.use(flash())


app.listen(3000, () => {
    console.log('Listening')
})





app.use((req, res, next) => {
    res.locals.success = req.flash('success') || false
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.session.currentUser
    next()
})





app.get('/', (req, res) => {
    res.locals.title = 'Home'
    res.render('cars/homepage')
})

app.use('/car', carRoutes)

app.use('/book', bookRoutes)


















//User routes
app.get('/user/register', (req, res) => {
    res.locals.title = 'Register'
    res.render('users/register')
})

app.post('/user/register', checkRegister, catchAsync(async (req, res) => {
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

app.get('/user/login', (req, res) => {
    res.locals.title = 'Login'
    res.render('users/login')
})

app.post('/user/login', catchAsync(async (req, res) => {
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
app.get('/user/logout', isLoggedIn, (req, res) => {
    req.session.currentUser = undefined
    req.flash('success', 'See you later!')
    res.redirect('/')
})








//Review routes
app.post('/car/:carId/review', isLoggedIn, catchAsync(async (req, res) => {
    const { reviewRating, reviewComment } = req.body
    const carId = req.params.carId
    const car = await carModel.findById(carId)
    const user = await userModel.findById(req.session.currentUser._id)
    const review = new reviewModel({ reviewRating, reviewComment, reviewOwner: user })
    car.carReviews.push(review)
    await car.save()
    await review.save()
    req.flash('success', 'Review has been added succesfully')
    res.redirect(`/car/${carId}`)
}))

app.delete('/car/:carId/review/:reviewId', isLoggedIn, isReviewOwnerOrAdmin, catchAsync(async (req, res) => {
    const { carId, reviewId } = req.params
    await reviewModel.findByIdAndDelete(reviewId)
    const car = await carModel.findById(carId)
    const reviewIndex = car.carReviews.indexOf(reviewId)
    car.carReviews.splice(reviewIndex, 1)
    await car.save()
    req.flash('success', 'Review has been deleted succesfully')
    res.redirect(`/car/${carId}`)
}))





app.use((req, res, next) => {
    //For any unfound webpages
    throw new expressError('Cannot find the specified webpage!', 404)
})

app.use((err, req, res, next) => {
    //Error handler
    res.locals.title = 'Error'
    const { message = 'Something went wrong!', status = 500 } = err
    const stack = err.stack
    res.status(status).render('error', { message, status, stack })
})