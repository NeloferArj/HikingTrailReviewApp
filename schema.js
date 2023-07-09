const Joi = require('joi');

module.exports.restaurantSchema = Joi.object({
    restaurant: Joi.object({
      name: Joi.string().required(),
        imgURL: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
      body: Joi.string().required(),
      rating: Joi.number().min(1).max(5).required()
    }).required()
});


// module.exports.reviewSchema = Joi.object({
//     review: Joi.object({
//         rating: Joi.number().required().min(1).max(5),
//         body: Joi.string().required()
//     }).required()
// })