const joi = require('joi')
const expressError = require('./expressError')

function carValidate(req, res, next) {
    //Schema to validate the car
    const schema = joi.object({
        carMake: joi.string().required().messages({
            'string.base': `"Make" should be a type of 'text'`,
            'string.empty': `"Make" cannot be an empty field`,
            'string.required': `"Make" is a required field`
        }),
        carModel: joi.string().required().messages({
            'string.base': `"Model" should be a type of 'text'`,
            'string.empty': `"Model" cannot be an empty field`,
            'string.required': `"Model" is a required field`
        }),
        carYear: joi.number().required().min(1900).max(2023).messages({
            'number.base': `"Year" should be a type of 'number'`,
            'number.empty': `"Year" cannot be an empty field`,
            'number.min': `"Year" should have a minimum value of 1900`,
            'number.max': `"Year" should have a maximum value of 2023`,
            'any.required': `"Year" is a required field`
        }),
        carPrice: joi.number().required().min(0).messages({
            'number.base': `"Price" should be a type of 'number'`,
            'number.empty': `"Price" cannot be an empty field`,
            'number.min': `"Price" should have a minimum value of 0`,
            'any.required': `"Price" is a required field`
        }),
        carDescription: joi.string().required().messages({
            'string.base': `"Description" should be a type of 'text'`,
            'string.empty': `"Description" cannot be an empty field`,
            'string.required': `"Description" is a required field`
        }),
        carImages: joi.any().required().messages({
            'any.empty': `"Images" must be provided`,
            'any.required': `"Images" must be provided`
        })
    })

    const { carMake, carModel, carYear, carPrice, carDescription } = req.body

    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))

    const { error } = schema.validate({ carMake, carModel, carYear, carPrice, carDescription, carImages: images })
    //If an error has been found, throw an error otherwise continue with saving
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    }
    else {
        next()
    }
}

module.exports = carValidate