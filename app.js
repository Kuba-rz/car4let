require('dotenv').config()
const express = require('express')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcrypt')

const { cloudinary, storage } = require('./cloudinary/index')
const multer = require('multer')
const upload = multer({ storage: storage })

const carModel = require('./models/carModel')

const expressError = require('./helpers/expressError')

const carValidate = require('./helpers/carValidate')
const { catchAsync, checkRegister } = require('./helpers/functions')









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
    next()
})





app.get('/', (req, res) => {
    res.locals.title = 'Home'
    res.render('cars/homepage')
    console.log(req.session)
})





//Car routes
app.get('/car/new', (req, res) => {
    const makes = require('./helpers/carMakes')
    res.locals.title = 'Add a new car'
    res.render('cars/new', { makes })
})

app.get('/car/viewAll', catchAsync(async (req, res) => {
    res.locals.title = 'All cars'
    const cars = await carModel.find({})
    res.render('cars/viewAll', { cars })
}))

app.get('/car/:id', catchAsync(async (req, res) => {
    try {
        //If id does not exist in the database, redirect the user with a flash message
        const car = await carModel.findById(req.params.id)
        res.locals.title = `${car.carMake} ${car.carModel}`
        res.render('cars/viewOne', { car })
    }
    catch {
        throw new expressError('Cannot find the specified car', 404)
    }
}))

//Render edit form and populate the fields
app.get('/car/:id/edit', catchAsync(async (req, res) => {
    const car = await carModel.findById(req.params.id)
    const makes = require('./helpers/carMakes')
    res.locals.title = `Edit`
    res.render('cars/edit', { car, makes })
}))

//Update car
app.put('/car/:id/edit', upload.array('carImages'), catchAsync(async (req, res) => {
    const { carMake, carYear, carPrice, carDescription, deleteImages } = req.body
    const model = req.body.carModel
    //Update the fields in the DB
    const car = await carModel.findByIdAndUpdate(req.params.id, { carMake, carModel: model, carYear, carPrice, carDescription })
    //Create an array for the uploaded images
    const imgs = req.files.map(item => {
        const container = {};
        container.url = item.path;
        container.filename = item.filename;
        return container;
    })
    car.carImages.push(...imgs)
    //If user has selected images to delete, for each one delete it from cloudinary and then from DB
    if (deleteImages && deleteImages.length > 0) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename)
        }
        await car.updateOne({ $pull: { carImages: { filename: { $in: deleteImages } } } })
    }
    await car.save()
    req.flash('success', 'Car succesfully updated')
    res.redirect(`/car/${car.id}`)
}))

app.delete('/car/:id', catchAsync(async (req, res) => {
    const id = req.params.id
    const car = await carModel.findById(id)
    if (car.carImages.length) {
        for (let img of car.carImages) {
            cloudinary.uploader.destroy(img.filename)
        }
    }
    await carModel.findByIdAndDelete(id)
    req.flash('success', 'Car succesfully deleted')
    res.redirect('/car/viewAll')
}))

app.post('/car/new', upload.array('carImages'), carValidate, catchAsync(async (req, res) => {
    const car = new carModel(req.body)
    //Loop over the uploaded images and create a new array of objects, containing the url and pathname to store in the DB
    car.carImages = req.files.map(item => {
        const container = {};
        container.url = item.path;
        container.filename = item.filename;
        return container;
    })
    await car.save()
    req.flash('success', 'Car succesfully added')
    res.redirect(`/car/${car.id}`)
}))






//User routes
app.get('/user/register', (req, res) => {
    res.locals.title = 'Register'
    res.render('users/register')
})

app.post('/user/register', (req, res) => {
    //Store user in req.session.user
    //Add checkRegister middleware
    res.send(req.body)
})







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