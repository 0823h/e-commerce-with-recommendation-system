import Joi from 'joi';

export const authRegisterBody = {
  body: Joi.object({
    email: Joi.string().email().required(),
    phone_number: Joi.string().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    address: Joi.string().required(),
  }),
};

export const authLoginBody = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
