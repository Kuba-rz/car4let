const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const carMakes = require('../helpers/carMakes')

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const carSchema = new Schema({
    carMake: {
        type: String,
        required: true,
        enum: carMakes,
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
    carImages: [imageSchema],
    carReviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

const Cars = mongoose.model('Car', carSchema)

module.exports = Cars