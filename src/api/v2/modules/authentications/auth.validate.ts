import Joi from 'joi';

export const authRegisterBody = {
  body: Joi.object({
    email: Joi.string().email().required(),
    phone_number: Joi.string().required(),
    password: Joi.string().required(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
  }),
};

export const authLoginBody = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
