import { Joi } from 'express-validation';

export const productCreatePayload = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    images: Joi.array().items(Joi.string().required()).optional(),
    quantity: Joi.number().min(0).required(),
  }),
};
