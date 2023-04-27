import { Joi } from 'express-validation';

export const createAdminBody = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('superadmin', 'staff').required(),
    full_name: Joi.string().required(),
  }),
};
