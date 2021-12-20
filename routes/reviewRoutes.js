const express = require('express')
const router = express.Router({ mergeParams: true })


const carModel = require('../models/carModel')
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel')

const { catchAsync, isLoggedIn, isReviewOwnerOrAdmin } = require('../helpers/functions')

//Review routes
router.post('/', isLoggedIn, catchAsync(async (req, res) => {
    const { reviewRating, reviewComment } = req.body
    const carId = req.params.carId
    const car = await carModel.findById(carId)
    const user = await userModel.findById(req.session.currentUser._id)
    const review = new reviewModel({ reviewRating, reviewComment, reviewOwner: user })
    car.carReviews.push(review)
    await car.save()
    await review.save()
    req.flash('success', 'Review has been added succesfully')
    res.redirect(`/car/${carId}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewOwnerOrAdmin, catchAsync(async (req, res) => {
    const { carId, reviewId } = req.params
    await reviewModel.findByIdAndDelete(reviewId)
    const car = await carModel.findById(carId)
    const reviewIndex = car.carReviews.indexOf(reviewId)
    car.carReviews.splice(reviewIndex, 1)
    await car.save()
    req.flash('success', 'Review has been deleted succesfully')
    res.redirect(`/car/${carId}`)
}))

module.exports = router