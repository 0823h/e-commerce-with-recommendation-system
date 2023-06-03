import { Joi } from 'express-validation';

export const orderCreateBody = {
  body: Joi.object({
    user_id: Joi.number().required(),
    address: Joi.string().required(),
    order: Joi.array().items(
      Joi.object({ product_id: Joi.number().optional(), quantity: Joi.number().optional() }).optional()
    ),
  }),
};

export const orderPayBody = {
  body: Joi.object({
    total_order_amount: Joi.string().required(),
    price: Joi.number().required(),
  }),
};
