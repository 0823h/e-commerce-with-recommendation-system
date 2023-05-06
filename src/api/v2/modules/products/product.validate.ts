import { Joi } from 'express-validation';

export const productCreateBody = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    images: Joi.array().items(Joi.string().required()).optional(),
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
