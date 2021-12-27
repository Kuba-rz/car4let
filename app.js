require('dotenv').config()
const express = require('express')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')

const expressError = require('./helpers/expressError')

const carRoutes = require('./routes/carRoutes')
const bookRoutes = require('./routes/bookRoutes')
const userRoutes = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes')






//Database URL depending if we are in production
//mongoAtlasURL=mongodb+srv://kuba-rz:KubaKlaudia098@car4letcluster.nesom.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
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

app.get('/contact', (req, res) => {
    res.locals.title = 'Contact'
    res.render('contact')
})

app.use('/car', carRoutes)

app.use('/book', bookRoutes)

app.use('/user', userRoutes)

app.use('/car/:carId/review', reviewRoutes)





app.use((req, res, next) => {
    //For any unfound webpages
    throw new expressError('Cannot find the specified webpage!', 404)
})

app.use((err, req, res, next) => {
    //Error handler
    res.locals.title = 'Error'
    const { message = 'Something went wrong!', status = 500 } = err
    const fullUrl = ((status != 404) ? req.protocol + '://' + req.get('host') + req.originalUrl : '/');

    res.status(status).render('error', { message, status, fullUrl })
})