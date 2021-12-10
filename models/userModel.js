const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email address must be provided'],
        unique: [true, 'The specified email address has already been registered']
    },
    username: {
        type: String,
        required: [true, 'Username must be provided'],
        unique: [true, 'The specified username has already been registered'],
    },
    hash: {
        type: Number,
        required: [true, 'Password must be provided']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        required: true
    }
})

const Users = mongoose.model('User', userSchema)

module.exports = Users