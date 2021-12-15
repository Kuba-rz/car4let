const mongoose = require('mongoose')
const dateTime = require('date-and-time')

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
        type: String
    },
    bookedUntil: {
        type: String
    }
})

bookingSchema.virtual('daysBooked').get(function () {
    const newFrom = this.bookedFrom.replace(/-/g, '/')
    const newUntil = this.bookedUntil.replace(/-/g, '/')
    const parsedFrom = dateTime.parse(newFrom, 'YYYY/MM/DD')
    const parsedUntil = dateTime.parse(newUntil, 'YYYY/MM/DD')
    console.log(parsedFrom)
    console.log(typeof parsedFrom)
    console.log(newUntil)
    console.log(typeof parsedUntil)
    const daysBooked = dateTime.subtract(parsedUntil, parsedFrom).toDays();
    return daysBooked
})

const Bookings = mongoose.model('Booking', bookingSchema)

module.exports = Bookings