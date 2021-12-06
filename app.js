const express = require('express')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const path = require('path')
const mongoose = require('mongoose')

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

app.post('/car/new', (req, res) => {
    console.log(req.body)
    res.redirect('/car/new')
})