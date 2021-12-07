require('dotenv').config()
const express = require('express')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const path = require('path')
const mongoose = require('mongoose')

const { storage } = require('./cloudinary/index')
const multer = require('multer')
const upload = multer({ storage: storage })

const carModel = require('./models/carModel')

const expressError = require('./helpers/expressError')

const carValidate = require('./helpers/carValidate')
const { catchAsync } = require('./helpers/functions')









//Database URL depending if we are in production
const DBUrl = process.env.mongoAtlasURL || 'mongodb://localhost:27017/car4let'

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

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/img', express.static(__dirname + '/images'));


app.listen(3000, () => {
    console.log('Listening')
})

app.get('/', (req, res) => {
    res.locals.title = 'Home'
    res.render('cars/homepage')
})

app.get('/car/new', (req, res) => {
    const makes = require('./helpers/carMakes')
    res.locals.title = 'Add a new car'
    res.render('cars/new', { makes })
})

app.get('/car/view', catchAsync(async (req, res) => {
    res.locals.title = 'All cars'
    const cars = await carModel.find({})
    res.render('cars/view', { cars })
}))

app.post('/car/new', upload.array('carImages'), carValidate, catchAsync(async (req, res) => {
    console.log(req.files)
    const car = new carModel(req.body)
    car.carImages = req.files.map(item => {
        const container = {};
        container.url = item.path;
        container.filename = item.filename;
        return container;
    })
    console.log(car.carImages)
    console.log(car)
    await car.save()
    res.redirect('/car/new')
}))







app.use((req, res, next) => {
    throw new expressError('Cannot find the specified webpage!', 404)
})

app.use((err, req, res, next) => {
    res.locals.title = 'Error'
    const { message = 'Something went wrong!', status = 500 } = err
    const stack = err.stack
    res.status(status).render('error', { message, status, stack })
})