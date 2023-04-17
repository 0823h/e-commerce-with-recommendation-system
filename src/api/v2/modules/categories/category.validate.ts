import { Joi } from 'express-validation';

export const categoryCreateBody = {
  body: Joi.object({
    name: Joi.string().required(),
  }),
};
