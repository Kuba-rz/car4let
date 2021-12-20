const express = require('express')
const router = express.Router()
const { catchAsync, isAdmin } = require('../helpers/functions')

const carModel = require('../models/carModel')
const bookModel = require('../models/bookingModel')

require('dotenv').config()

const { cloudinary, storage } = require('../cloudinary/index')
const multer = require('multer')
const upload = multer({ storage: storage })

const expressError = require('../helpers/expressError')

const carValidate = require('../helpers/carValidate')



//Car routes
router.get('/new', isAdmin, (req, res) => {
    const makes = require('../helpers/carMakes')
    res.locals.title = 'Add a new car'
    res.render('cars/new', { makes })
})

router.get('/viewAll', catchAsync(async (req, res) => {
    res.locals.title = 'All cars'
    const cars = await carModel.find({}).populate({
        path: 'carBooking',
        populate: { path: 'bookedBy' }
    })
    res.render('cars/viewAll', { cars })
}))

router.get('/:carId', catchAsync(async (req, res) => {
    try {
        //If id does not exist in the database, redirect the user with a flash message
        const car = await carModel.findById(req.params.carId).populate({
            path: 'carReviews',
            populate: {
                path: 'reviewOwner'
            }
        })
        res.locals.title = `${car.carMake} ${car.carModel}`
        res.render('cars/viewOne', { car })
    }
    catch {
        throw new expressError('Cannot find the specified car', 404)
    }
}))

//Render edit form and populate the fields
router.get('/:carId/edit', isAdmin, catchAsync(async (req, res) => {
    const car = await carModel.findById(req.params.carId)
    const makes = require('../helpers/carMakes')
    res.locals.title = `Edit`
    res.render('cars/edit', { car, makes })
}))


//Update car
router.put('/:carId/edit', isAdmin, upload.array('carImages'), catchAsync(async (req, res) => {
    const { carMake, carYear, carPrice, carDescription, deleteImages } = req.body
    const model = req.body.carModel
    //Update the fields in the DB
    const car = await carModel.findByIdAndUpdate(req.params.carId, { carMake, carModel: model, carYear, carPrice, carDescription })
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

router.delete('/:carId', isAdmin, catchAsync(async (req, res) => {
    const id = req.params.carId
    const car = await carModel.findById(id)
    if (car.carImages.length) {
        for (let img of car.carImages) {
            cloudinary.uploader.destroy(img.filename)
        }
    }
    await carModel.findByIdAndDelete(id)
    const bookings = await bookModel.findOneAndDelete({ bookedCar: id })
    req.flash('success', 'Car succesfully deleted')
    res.redirect('/car/viewAll')
}))

router.post('/new', isAdmin, upload.array('carImages'), carValidate, catchAsync(async (req, res) => {
    const car = new carModel(req.body)
    //Loop over the uploaded images and create a new array of objects, containing the url and pathname to store in the DB
    car.carImages = req.files.map(item => {
        const container = {};
        container.url = item.path;
        container.filename = item.filename;
        return container;
    })
    car.carBooking = { booked: false }
    await car.save()
    req.flash('success', 'Car succesfully added')
    res.redirect(`/car/${car.id}`)
}))


module.exports = router