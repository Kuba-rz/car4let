const express = require('express')
const router = express.Router()

require('dotenv').config()


const carModel = require('../models/carModel')
const userModel = require('../models/userModel')

const bookingModel = require('../models/bookingModel')


const carValidate = require('../helpers/carValidate')
const { catchAsync, isLoggedIn, validDates, carNotBooked, isAdmin } = require('../helpers/functions')


//Booking routes
router.get('/viewAll', isAdmin, catchAsync(async (req, res) => {
    res.locals.title = 'All bookings'
    const bookings = await bookingModel.find({}).populate('bookedBy').populate('bookedCar')
    res.render('bookings/viewAll', { bookings })
}))

router.get('/viewMy', isLoggedIn, catchAsync(async (req, res) => {
    res.locals.title = 'My bookings'
    const bookings = await bookingModel.find({ bookedBy: { _id: req.session.currentUser._id } }).populate('bookedCar')
    res.render('bookings/viewMy', { bookings })
}))

router.get('/:carId', isLoggedIn, carNotBooked, catchAsync(async (req, res) => {
    res.locals.title = 'Book car'
    const car = await carModel.findById(req.params.carId)
    res.render('bookings/book', { car })
}))


router.post('/:carId', isLoggedIn, validDates, carNotBooked, catchAsync(async (req, res) => {
    const { bookedFrom, bookedUntil } = req.body
    const car = await carModel.findById(req.params.carId)
    const user = await userModel.findById(req.session.currentUser._id)
    const carBooking = { booked: true, bookedBy: user, bookedFrom, bookedUntil }
    car.carBooking = carBooking
    await car.save()
    const newBooking = new bookingModel({ bookedBy: user, bookedCar: car, bookedFrom, bookedUntil })
    await newBooking.save()
    req.flash('success', 'Car has been booked succesfully')
    res.redirect(`/car/${car._id}`)
}))

router.delete('/:carId/:bookingId', isAdmin, catchAsync(async (req, res) => {
    const { carId, bookingId } = req.params
    const car = await carModel.findById(carId)
    const booking = await bookingModel.findByIdAndDelete(bookingId)
    car.carBooking = { booked: false }
    await car.save()
    req.flash('success', 'Booking ended succesfully')
    res.redirect('/book/viewAll')
}))

module.exports = router