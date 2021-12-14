const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    bookedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookedCar: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    bookedFrom: {
        type: Date
    },
    bookedUntil: {
        type: Date
    }
})

const Bookings = mongoose.model('Booking', bookingSchema)

module.exports = Bookings