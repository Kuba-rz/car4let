const mongoose = require('mongoose')

const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    reviewRating: {
        type: Number,
        required: true,
    },
    reviewComment: {
        type: String,
        required: true
    },
    reviewOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

const Reviews = mongoose.model('Review', reviewSchema)

module.exports = Reviews