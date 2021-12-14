const carModel = require('../models/carModel')
const mongoose = require('mongoose')
const carMakes = require('./carMakes')

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

async function seed() {
    await carModel.remove({})

    for (let i = 0; i < 10; i++) {
        const carMake = carMakes[[Math.floor(Math.random() * carMakes.length)]]
        const carPrice = Math.floor(Math.random() * 100)
        const carImages = { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80', filename: 'SEEDING' }
        const carBooking = { booked: false }
        const car = new carModel({ carMake, carModel: 'Seeding test', carYear: 2015, carPrice, carDescription: 'This is from a generic seed guys', carImages, carBooking })
        await car.save()
    }
}

seed().then(() => {
    mongoose.connection.close()
})