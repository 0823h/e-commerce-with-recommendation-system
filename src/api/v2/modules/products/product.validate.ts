import { Joi } from 'express-validation';

export const productCreateBody = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    main_image: Joi.string().optional(),
    sub_images: Joi.array().items(Joi.string().required()).optional(),
    original_price: Joi.number().min(1).required(),
    current_price: Joi.number().min(1).required(),
    quantity: Joi.number().min(0).required(),
    categories: Joi.array().items(Joi.string().optional()).optional(),
  }),
};

export const productRateBody = {
  body: Joi.object({
    rate: Joi.number().required(),
  }),
};

export const productRateForGuestBody = {
  body: Joi.object({
    session_id: Joi.string().required(),
    rate: Joi.number().required()
  })
}

export const variantCreateBody = {
  body: Joi.object({
    quantity: Joi.number().required(),
    size: Joi.string().required(),
  }),
};

export const collaborativeFilteringForGuest = {
  body: Joi.object({
    session_id: Joi.string().required()
  })
};