import { Joi } from 'express-validation';

export const adminCreateOrderBody = {
  body: Joi.object({
    user_id: Joi.number().required(),
    address_id: Joi.number().required(),
    order: Joi.array().items(
      Joi.object({ variant_id: Joi.string().optional(), quantity: Joi.number().optional() }).optional()
    ),
  }),
};

export const userCreateOrderBody = {
  body: Joi.object({
    address: Joi.string().required(),
    email: Joi.string().required(),
    phone_number: Joi.string().required(),
    order: Joi.array().items(
      Joi.object({ variant_id: Joi.string().optional(), quantity: Joi.number().optional() }).optional()
    ),
    payment_method_id: Joi.number().required(),
  }),
};

export const orderPayBody = {
  body: Joi.object({
    total_order_amount: Joi.string().required(),
    price: Joi.number().required(),
  }),
};
