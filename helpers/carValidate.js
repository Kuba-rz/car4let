const joi = require('joi')
const expressError = require('./expressError')

function carValidate(req, res, next) {
    const schema = joi.object({
        carMake: joi.string().required(),
        carModel: joi.string().required(),
        carYear: joi.number().required(),
        carPrice: joi.number().required(),
        carDescription: joi.string().required(),
        carImages: joi.any().required()
    })
    const { carMake, carModel, carYear, carPrice, carDescription } = req.body
    if (req.files && req.files.length) {
        const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    }
    else {
        throw new expressError('Please provide images', 400)
    }
    const { error } = schema.validate({ carMake, carModel, carYear, carPrice, carDescription, carImages: req.files })
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }
    else {
        next()
    }
}

module.exports = carValidate