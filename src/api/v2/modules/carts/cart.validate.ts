import { Joi } from 'express-validation';

export const addProductToCartBody = {
  body: Joi.object({
    product_id: Joi.number().required(),
    quantity: Joi.number().optional(),
  }),
};
