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
        type: String,
        required: [true, 'Password must be provided']
    },
    admin: {
        type: Boolean,
        required: true
    },
    passwordRequest: {
        type: String
    }
})

userSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('The email address or username is already registered'));
    } else {
        next();
    }
});

const Users = mongoose.model('User', userSchema)

module.exports = Users