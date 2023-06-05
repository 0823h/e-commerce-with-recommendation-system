import { Joi } from 'express-validation';

export const userCreateBody = {
  body: Joi.object({
    email: Joi.string().required(),
    phone_number: Joi.string().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
  }),
};

export const userUpdateBody = {
  body: Joi.object({
    email: Joi.string().optional(),
    phone_number: Joi.string().optional(),
    password: Joi.string().optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
  }),
};
