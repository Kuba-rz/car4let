const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String
})

const carSchema = new Schema({
    carMake: {
        type: String,
        required: true
    },
    carModel: {
        type: String,
        required: true
    },
    carYear: {
        type: Number,
        required: true
    },
    carPrice: {
        type: Number,
        required: true
    },
    carDescription: {
        type: String
    },
    carImages: [imageSchema]
})

const Cars = mongoose.model('Car', carSchema)

module.exports = Cars