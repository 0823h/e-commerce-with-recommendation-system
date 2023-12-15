import { Joi } from 'express-validation';

export const createAdminBody = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('superadmin', 'staff', 'shipper').required(),
    full_name: Joi.string().required(),
  }),
};

export const signInBody = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
